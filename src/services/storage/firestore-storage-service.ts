import { initializeApp } from "firebase/app";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytes,
} from "firebase/storage";

const firebaseConfig = {
	// Suas credenciais
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export class FirebaseStorageService {
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		const storageRef = ref(storage, `products/${fileName}`);
		await uploadBytes(storageRef, imageBuffer);
		const url = await getDownloadURL(storageRef);
		return url;
	}

	async deleteImage(fileName: string): Promise<void> {
		const storageRef = ref(storage, `products/${fileName}`);
		await deleteObject(storageRef);
	}
}
