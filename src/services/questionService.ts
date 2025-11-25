import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocs,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { SurveyQuestion } from '../App';

const QUESTIONS_COLLECTION = 'questions';

/**
 * Subscribe to questions collection with real-time updates
 */
export const subscribeToQuestions = (
  onQuestions: (questions: SurveyQuestion[]) => void,
  onError: (error: any) => void
): (() => void) => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const q = query(questionsRef, orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questions: SurveyQuestion[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
          id: data.id,
          text: data.text,
          type: data.type,
          required: data.required,
          category: data.category,
          choices: data.choices,
          order: data.order,
        } as SurveyQuestion);
      });
      onQuestions(questions);
    }, (error) => {
      console.error('Error subscribing to questions:', error);
      onError(error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up questions listener:', error);
    onError(error);
    return () => {};
  }
};

/**
 * Get all questions from Firestore (one-time fetch)
 */
export const getAllQuestions = async (): Promise<SurveyQuestion[]> => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const q = query(questionsRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const questions: SurveyQuestion[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: data.id,
        text: data.text,
        type: data.type,
        required: data.required,
        category: data.category,
        choices: data.choices,
        order: data.order,
      } as SurveyQuestion);
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Add a new question to Firestore
 */
export const addQuestion = async (question: SurveyQuestion): Promise<string> => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    const docRef = await addDoc(questionsRef, {
      id: question.id,
      text: question.text,
      type: question.type,
      required: question.required,
      category: question.category,
      choices: question.choices || [],
      order: question.order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Question added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
};

/**
 * Update an existing question in Firestore
 */
export const updateQuestion = async (questionId: string, updates: Partial<SurveyQuestion>): Promise<void> => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Find the document with matching question ID
    const snapshot = await getDocs(questionsRef);
    let docId: string | null = null;
    let existingData: any = null;
    
    snapshot.forEach((doc) => {
      if (doc.data().id === questionId) {
        docId = doc.id;
        existingData = doc.data();
      }
    });
    
    if (!docId || !existingData) {
      throw new Error(`Question with ID ${questionId} not found`);
    }
    
    // Prepare the complete updated document
    const updatedData = {
      id: existingData.id || updates.id || questionId,
      text: updates.text !== undefined ? updates.text : existingData.text,
      type: updates.type !== undefined ? updates.type : existingData.type,
      required: updates.required !== undefined ? updates.required : existingData.required,
      category: updates.category !== undefined ? updates.category : existingData.category,
      choices: updates.choices !== undefined ? updates.choices : (existingData.choices || []),
      order: updates.order !== undefined ? updates.order : existingData.order,
      createdAt: existingData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = doc(db, QUESTIONS_COLLECTION, docId);
    await updateDoc(docRef, updatedData);
    
    console.log('✅ Question updated:', questionId, updatedData);
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

/**
 * Delete a question from Firestore
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Find the document with matching question ID
    const snapshot = await getDocs(query(questionsRef));
    let docId: string | null = null;
    
    snapshot.forEach((doc) => {
      if (doc.data().id === questionId) {
        docId = doc.id;
      }
    });
    
    if (!docId) {
      throw new Error(`Question with ID ${questionId} not found`);
    }
    
    const docRef = doc(db, QUESTIONS_COLLECTION, docId);
    await deleteDoc(docRef);
    
    console.log('✅ Question deleted:', questionId);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

/**
 * Reorder questions in Firestore (batch operation)
 */
export const reorderQuestions = async (orderedQuestions: SurveyQuestion[]): Promise<void> => {
  try {
    const db = getFirestore();
    const batch = writeBatch(db);
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Get all documents first
    const snapshot = await getDocs(questionsRef);
    const docMap = new Map<string, string>();
    
    snapshot.forEach((doc) => {
      docMap.set(doc.data().id, doc.id);
    });
    
    // Update each question with new order
    orderedQuestions.forEach((question) => {
      const docId = docMap.get(question.id);
      if (docId) {
        const docRef = doc(db, QUESTIONS_COLLECTION, docId);
        batch.update(docRef, {
          order: question.order,
          updatedAt: new Date(),
        });
      }
    });
    
    await batch.commit();
    console.log('✅ Questions reordered');
  } catch (error) {
    console.error('Error reordering questions:', error);
    throw error;
  }
};

/**
 * Sync all questions to Firestore (useful for initial setup)
 */
export const syncAllQuestions = async (questions: SurveyQuestion[]): Promise<void> => {
  try {
    const db = getFirestore();
    const batch = writeBatch(db);
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    
    // Get all existing documents
    const snapshot = await getDocs(questionsRef);
    const existingIds = new Map<string, string>();
    
    snapshot.forEach((doc) => {
      existingIds.set(doc.data().id, doc.id);
    });
    
    // Delete questions that are no longer in the list
    existingIds.forEach((docId, questionId) => {
      if (!questions.find(q => q.id === questionId)) {
        batch.delete(doc(db, QUESTIONS_COLLECTION, docId));
      }
    });
    
    // Add or update questions
    questions.forEach((question) => {
      const existingDocId = existingIds.get(question.id);
      if (existingDocId) {
        // Update existing
        batch.update(doc(db, QUESTIONS_COLLECTION, existingDocId), {
          id: question.id,
          text: question.text,
          type: question.type,
          required: question.required,
          category: question.category,
          choices: question.choices || [],
          order: question.order,
          updatedAt: new Date(),
        });
      } else {
        // Add new - use question.id as custom document ID for consistency
        batch.set(doc(db, QUESTIONS_COLLECTION, question.id), {
          id: question.id,
          text: question.text,
          type: question.type,
          required: question.required,
          category: question.category,
          choices: question.choices || [],
          order: question.order,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
    
    await batch.commit();
    console.log('✅ All questions synced to Firestore');
  } catch (error) {
    console.error('Error syncing questions:', error);
    throw error;
  }
};

/**
 * Check if questions exist in Firestore
 */
export const questionsExist = async (): Promise<boolean> => {
  try {
    const db = getFirestore();
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
    const snapshot = await getDocs(query(questionsRef));
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking questions:', error);
    return false;
  }
};
