import { initializeApp } from "firebase/app";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytes,
} from "firebase/storage";

// Verificar se as variáveis de ambiente do Firebase estão configuradas
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

// Verificar se o Firebase está configurado
const isFirebaseConfigured =
	firebaseConfig.apiKey &&
	firebaseConfig.authDomain &&
	firebaseConfig.projectId &&
	firebaseConfig.storageBucket;

let app: ReturnType<typeof initializeApp> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (isFirebaseConfigured) {
	try {
		app = initializeApp(firebaseConfig);
		storage = getStorage(app);
	} catch (error) {
		console.warn("Firebase não pôde ser inicializado:", error);
	}
}

export class FirebaseStorageService {
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		if (!isFirebaseConfigured || !storage) {
			throw new Error(
				"Firebase Storage não está configurado. Por favor, configure as variáveis de ambiente do Firebase ou use o LocalStorageService.",
			);
		}

		const storageRef = ref(storage, `products/${fileName}`);
		await uploadBytes(storageRef, imageBuffer);
		const url = await getDownloadURL(storageRef);
		return url;
	}

	async deleteImage(fileName: string): Promise<void> {
		if (!isFirebaseConfigured || !storage) {
			throw new Error(
				"Firebase Storage não está configurado. Por favor, configure as variáveis de ambiente do Firebase ou use o LocalStorageService.",
			);
		}

		const storageRef = ref(storage, `products/${fileName}`);
		await deleteObject(storageRef);
	}

	static isConfigured(): boolean {
		return isFirebaseConfigured && storage !== null;
	}
}
