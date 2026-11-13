import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const BACKUP_FILE_NAME = 'hamudi_message_backup.json';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of DRIVE_SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'select_account'
});

// Cache OAuth access token strictly in memory (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  try {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user && cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (!user) cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch (e) {
    return () => {};
  }
};

export const getCachedDriveToken = (): string | null => cachedAccessToken;

export const getCurrentGoogleUser = (): User | null => auth.currentUser;

export const googleSignInWithDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token');
    }
    cachedAccessToken = credential.accessToken;
    return {
      user: result.user,
      accessToken: cachedAccessToken
    };
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  try {
    await auth.signOut();
  } catch (e) {}
};

export interface DriveBackupFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

export const findDriveBackup = async (
  accessToken: string
): Promise<DriveBackupFile | null> => {
  const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!res.ok) {
    throw new Error(`Drive search failed: ${res.status}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
};

export const downloadDriveBackup = async (
  accessToken: string,
  fileId: string
): Promise<any> => {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  if (!res.ok) {
    throw new Error(`Drive download failed: ${res.status}`);
  }
  return res.json();
};

export const uploadNewDriveBackup = async (
  accessToken: string,
  backupPayload: any
): Promise<DriveBackupFile> => {
  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json'
  };
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([JSON.stringify(backupPayload)], { type: 'application/json' })
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    }
  );
  if (!res.ok) {
    throw new Error(`Drive upload failed: ${res.status}`);
  }
  return res.json();
};

export const overwriteDriveBackup = async (
  accessToken: string,
  fileId: string,
  backupPayload: any
): Promise<DriveBackupFile> => {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,modifiedTime`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backupPayload)
    }
  );
  if (!res.ok) {
    throw new Error(`Drive update failed: ${res.status}`);
  }
  return res.json();
};
