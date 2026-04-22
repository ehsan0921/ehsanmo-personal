// Cloudflare Pages Function: send email via Mailgun API (with image + settings attachments)
// Credentials are read from Cloudflare Variables and Secrets (MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL).

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const apiKey = (env.MAILGUN_API_KEY || '').trim();
    const domain = (env.MAILGUN_DOMAIN || '').trim();
    const fromEmail = (env.MAILGUN_FROM_EMAIL || '').trim();
    
    if (!apiKey || !domain || !fromEmail) {
        return Response.json({ error: 'Server misconfiguration: Mailgun credentials not set. Check Cloudflare Variables.' }, { status: 500 });
    }
    
    if (!fromEmail.includes('@')) {
        return Response.json({ error: `Server misconfiguration: MAILGUN_FROM_EMAIL '${fromEmail}' appears invalid.` }, { status: 500 });
    }

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
        return Response.json({ error: 'Server misconfiguration: MAILGUN_DOMAIN appears invalid.' }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { to, subject, html, imageBase64, settingsText, projectName } = body || {};
    if (!to || !subject || !html || typeof to !== 'string' || typeof subject !== 'string' || typeof html !== 'string') {
        return Response.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const recipients = to
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    if (!recipients.length || recipients.length > 5) {
        return Response.json({ error: 'Recipient list must contain between 1 and 5 emails.' }, { status: 400 });
    }
    if (recipients.some((email) => !isValidEmail(email))) {
        return Response.json({ error: 'One or more recipient emails are invalid.' }, { status: 400 });
    }

    const safeSubject = subject.trim();
    if (safeSubject.length < 2 || safeSubject.length > 160) {
        return Response.json({ error: 'Subject length must be between 2 and 160 characters.' }, { status: 400 });
    }
    if (html.length > 300000) {
        return Response.json({ error: 'HTML content too large.' }, { status: 413 });
    }
    if (settingsText && String(settingsText).length > 300000) {
        return Response.json({ error: 'Settings attachment text too large.' }, { status: 413 });
    }
    if (imageBase64 && String(imageBase64).length > 14 * 1024 * 1024) {
        return Response.json({ error: 'Image attachment too large.' }, { status: 413 });
    }

    const form = new FormData();
    form.append('from', fromEmail);
    form.append('to', recipients.join(','));
    form.append('subject', safeSubject);
    form.append('html', html);

    if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = base64ToArrayBuffer(base64Data);
        form.append('attachment', new Blob([imageBytes], { type: 'image/png' }), (projectName || 'pattern') + '.png');
    }
    if (settingsText) {
        form.append('attachment', new Blob([settingsText], { type: 'text/plain' }), (projectName || 'settings') + '.txt');
    }

    const mailgunUrlUS = `https://api.mailgun.net/v3/${domain}/messages`;
    const mailgunUrlEU = `https://api.eu.mailgun.net/v3/${domain}/messages`;
    const auth = btoa('api:' + apiKey);

    // Try US endpoint first
    let res = await fetch(mailgunUrlUS, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + auth
        },
        body: form
    });

    // If unauthorized (401), try EU endpoint
    if (res.status === 401) {
        // Clone body for retry (FormData is consumable) - actually fetch body isn't consumable but just in case
        // Wait, FormData cannot be reused easily if consumed? No, fetch doesn't consume it in a way that prevents reuse.
        // But let's create a new FormData just to be safe or reuse the existing one.
        // Re-creating is safer.
        const formEU = new FormData();
        for (const [key, value] of form.entries()) {
            formEU.append(key, value);
        }

        res = await fetch(mailgunUrlEU, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth
            },
            body: formEU
        });
    }

    const text = await res.text();
    if (!res.ok) {
        try {
            const err = JSON.parse(text);
            return Response.json({ error: err.message || text }, { status: res.status });
        } catch (e) {
            return Response.json({ error: text || 'Mailgun error' }, { status: res.status });
        }
    }
    return Response.json({ success: true });
}
