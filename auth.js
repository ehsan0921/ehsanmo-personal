// Authentication and User Management
// Firebase imports will be loaded via CDN in HTML

class AuthManager {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.isAdmin = false;
        this.adminUsername = import.meta.env?.VITE_ADMIN_USERNAME || 'admin';
        this.adminPassword = import.meta.env?.VITE_ADMIN_PASSWORD || 'admin123';
    }

    async init(firebaseConfig) {
        // Initialize Firebase (will be done via CDN in HTML)
        return new Promise((resolve) => {
            if (window.firebase) {
                try {
                    // Check if already initialized with a different config
                    if (firebase.apps.length > 0) {
                        const existingApp = firebase.apps[0];
                        const existingOptions = existingApp.options || {};
                        if (existingOptions.projectId !== firebaseConfig.projectId) {
                            console.warn('AuthManager: Firebase was initialized with wrong project:', existingOptions.projectId);
                        }
                    }
                    // Only initialize if not already done
                    if (firebase.apps.length === 0) {
                        firebase.initializeApp(firebaseConfig);
                    }
                } catch (error) {
                    console.error('Firebase initialization error in AuthManager:', error);
                }
                
                this.auth = firebase.auth();
                this.db = firebase.firestore();
                
                // Listen for auth state changes
                this.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.checkAdminStatus();
                    this.updateUI();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    async checkAdminStatus() {
        if (!this.currentUser) {
            this.isAdmin = false;
            return;
        }
        // Check if user is admin via custom claim or Firestore
        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            this.isAdmin = userDoc.exists && userDoc.data().isAdmin === true;
        } catch (e) {
            this.isAdmin = false;
        }
    }

    async signInWithEmail(email, password) {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            await this.trackLogin();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signUpWithEmail(email, password) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            // Create user document
            await this.db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isAdmin: false,
                downloadCount: 0
            });
            await this.trackLogin();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await this.auth.signInWithPopup(provider);
            // Create user document if doesn't exist
            const userDoc = await this.db.collection('users').doc(userCredential.user.uid).get();
            if (!userDoc.exists) {
                await this.db.collection('users').doc(userCredential.user.uid).set({
                    email: userCredential.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isAdmin: false,
                    downloadCount: 0
                });
            }
            await this.trackLogin();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.isAdmin = false;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async trackLogin() {
        if (!this.currentUser) return;
        try {
            await this.db.collection('loginLogs').add({
                userId: this.currentUser.uid,
                email: this.currentUser.email,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error('Failed to track login:', e);
        }
    }

    async trackDownload(fileType) {
        if (!this.currentUser) return;
        try {
            // Track download
            await this.db.collection('downloads').add({
                userId: this.currentUser.uid,
                email: this.currentUser.email,
                fileType: fileType,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update user download count
            await this.db.collection('users').doc(this.currentUser.uid).update({
                downloadCount: firebase.firestore.FieldValue.increment(1)
            });
        } catch (e) {
            console.error('Failed to track download:', e);
        }
    }

    async adminLogin(username, password) {
        if (username === this.adminUsername && password === this.adminPassword) {
            // Set admin session
            sessionStorage.setItem('adminSession', 'true');
            this.isAdmin = true;
            return { success: true };
        }
        return { success: false, error: 'Invalid admin credentials' };
    }

    checkAdminSession() {
        const adminSession = sessionStorage.getItem('adminSession');
        if (adminSession === 'true') {
            this.isAdmin = true;
        }
    }

    updateUI() {
        // This will be called from main script to update UI based on auth state
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI(this.currentUser, this.isAdmin);
        }
    }

    canDownload(fileType) {
        // Guest users can only download PNG and TXT
        if (!this.currentUser) {
            return fileType === 'png' || fileType === 'txt';
        }
        // Registered users can download all formats
        return true;
    }
}

// Export for use in main script
window.AuthManager = AuthManager;
