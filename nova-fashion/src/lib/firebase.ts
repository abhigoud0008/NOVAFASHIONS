import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection,
  query,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { Product, Order } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Error Handling block requested by system instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Connection Validation Check
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection Active.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client appears offline.");
    }
  }
}

// 2. User Authentication Helpers (Custom Phone Number + Password)
export interface PhoneUser {
  phone: string;
  createdAt: string;
}

export async function loginWithPhone(phone: string, pass: string): Promise<PhoneUser> {
  const cleanPhone = phone.trim();
  const path = `users/${cleanPhone}`;
  
  if (cleanPhone === '9346507994') {
    if (pass !== '@abhigoud123') {
      throw new Error("Incorrect administrator password.");
    }
  }

  try {
    const userDocRef = doc(db, 'users', cleanPhone);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      // Direct register on the fly for new users.
      const newUser = {
        phone: cleanPhone,
        password: pass,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      return {
        phone: newUser.phone,
        createdAt: newUser.createdAt
      };
    }
    
    const userData = userSnap.data();
    if (userData.password && userData.password !== pass) {
      throw new Error("Password mismatch for this phone number. Please retry.");
    }
    
    return {
      phone: userData.phone,
      createdAt: userData.createdAt,
    };
  } catch (err: any) {
    if (err.message && (err.message.includes("Incorrect") || err.message.includes("Password") || err.message.includes("retry"))) {
      throw err;
    }
    handleFirestoreError(err, OperationType.GET, path);
    throw err;
  }
}

export async function registerWithPhone(phone: string, pass: string): Promise<PhoneUser> {
  const cleanPhone = phone.trim();
  const path = `users/${cleanPhone}`;
  if (!cleanPhone || !pass) {
    throw new Error("Phone number and credentials are required.");
  }

  try {
    const userDocRef = doc(db, 'users', cleanPhone);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      throw new Error("An account already exists for this phone number. Please login directly.");
    }

    const newUser = {
      phone: cleanPhone,
      password: pass,
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, newUser);

    return {
      phone: newUser.phone,
      createdAt: newUser.createdAt
    };
  } catch (err: any) {
    if (err.message && err.message.includes("already exists")) {
      throw err;
    }
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// 3. Dress Catalog Helpers
export async function fetchProductsFromFirebase(): Promise<Product[]> {
  const path = 'products';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Product[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Product);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addProductToFirebase(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirebase(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateProductPriceInFirebase(productId: string, newPrice: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, { price: newPrice });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateProductStockInFirebase(productId: string, newInStock: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, { inStock: newInStock });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Seed helper (seeds default catalog if firebase is currently empty)
export async function seedProductsIfEmpty(initialList: Product[]): Promise<Product[]> {
  const current = await fetchProductsFromFirebase();
  if (current.length > 0) {
    return current;
  }
  // Otherwise, seed database
  console.log("Seeding products to Firestore database...");
  for (const prod of initialList) {
    await addProductToFirebase(prod);
  }
  return initialList;
}

// 4. Booking/Ordering Helpers
export async function fetchOrdersFromFirebase(customerPhone?: string): Promise<Order[]> {
  const path = 'orders';
  try {
    let qSnapshot;
    if (customerPhone) {
      const q = query(collection(db, path), where('customerPhone', '==', customerPhone.trim()));
      qSnapshot = await getDocs(q);
    } else {
      qSnapshot = await getDocs(collection(db, path));
    }
    
    const items: Order[] = [];
    qSnapshot.forEach((doc) => {
      items.push(doc.data() as Order);
    });
    
    // Sort by newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addOrderToFirebase(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOrderStatusInFirebase(orderId: string, status: any): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
