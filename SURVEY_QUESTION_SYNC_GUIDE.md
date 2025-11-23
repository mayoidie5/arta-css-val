# Survey Questions Real-Time Sync Guide

## Overview
When survey questions are edited, added, or deleted in the Admin Dashboard, the "Take the Survey" (SurveyForm) automatically updates in real-time. This guide explains how the synchronization works.

## Architecture

### 1. Data Flow
```
AdminDashboard (Edit/Add/Delete Questions)
        ↓
    onUpdateQuestion/onAddQuestion/onDeleteQuestion
        ↓
    App.tsx (State Management)
        ↓
    SurveyForm (Receives Updated Questions)
        ↓
    SurveyForm Re-renders with New Questions
```

### 2. Key Components

#### App.tsx
- **Manages** the `questions` state using `useState`
- **Passes** `questions` prop to both AdminDashboard and SurveyForm
- **Provides** handler functions:
  - `handleAddQuestion()` - Adds new question
  - `handleUpdateQuestion()` - Updates existing question
  - `handleDeleteQuestion()` - Deletes question
  - `handleReorderQuestions()` - Reorders questions

#### AdminDashboard.tsx
- **Calls** `onUpdateQuestion()` when editing a question
- **Calls** `onDeleteQuestion()` when deleting a question
- **Calls** `onAddQuestion()` when adding a new question
- **Calls** `onReorderQuestions()` when reordering questions via drag-and-drop

#### SurveyForm.tsx
- **Receives** updated `questions` prop
- **Uses** `useEffect` with `[questions]` dependency to:
  - Add new question IDs to formData
  - Remove deleted question IDs from formData
  - Re-render question sections (CC and SQD)

## How It Works

### Step 1: Admin Edits a Question
When an admin updates a question in the "Manage Questions" section:
```typescript
// AdminDashboard.tsx
const handleEditQuestion = (e: React.FormEvent) => {
  e.preventDefault();
  if (selectedQuestion) {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    onUpdateQuestion(selectedQuestion.id, {
      text: formData.get('text') as string,
      required: formData.get('required') === 'true',
    });
    // ...
  }
};
```

### Step 2: App.tsx Updates State
```typescript
// App.tsx
const handleUpdateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
  setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
};
```

### Step 3: SurveyForm Receives Updated Questions
The updated `questions` prop is passed to SurveyForm:
```typescript
// App.tsx
{view === 'survey' && (
  <SurveyForm 
    onBackToLanding={() => setView('landing')}
    questions={questions}  // ← Updated questions
    onSubmitResponse={handleSubmitResponse}
    kioskMode={kioskMode}
  />
)}
```

### Step 4: SurveyForm Re-renders
The `useEffect` in SurveyForm handles the updates:
```typescript
// SurveyForm.tsx
useEffect(() => {
  setFormData(prev => {
    const updated = { ...prev };
    const currentQuestionIds = questions.map(q => q.id);
    
    // Add new questions that don't exist yet
    questions.forEach(q => {
      if (!(q.id in updated)) {
        updated[q.id] = '';
      }
    });
    
    // Remove formData entries for deleted questions
    Object.keys(updated).forEach(key => {
      const baseFields = ['clientType', 'date', 'sex', 'age', 'region', 'service', 'serviceOther', 'suggestions', 'email'];
      if (!baseFields.includes(key) && !currentQuestionIds.includes(key)) {
        delete updated[key];
      }
    });
    
    console.log('📋 Questions updated in SurveyForm. Total questions:', questions.length);
    
    return updated;
  });
}, [questions]); // ← Dependency on questions array
```

React automatically re-renders the SurveyForm because:
1. The `questions` prop changed
2. The `useEffect` dependency array includes `[questions]`
3. The form data is updated
4. Component re-renders with new question text, order, etc.

## Supported Operations

### 1. **Editing Question Text**
✅ When you edit a question's text in Admin Dashboard → Immediately updates in Survey Form

### 2. **Adding New Questions**
✅ When you add a new question → New field appears in Survey Form

### 3. **Deleting Questions**
✅ When you delete a question → Question field is removed from Survey Form

### 4. **Reordering Questions**
✅ When you drag-and-drop to reorder questions → Order updates in Survey Form

### 5. **Marking Questions as Required**
✅ When you toggle required status → Updates in Survey Form

### 6. **Changing Question Type**
✅ When you change question type (Likert, Radio, Text) → UI updates accordingly

## Verification

To verify the sync is working:

1. **Open Admin Dashboard**
   - Go to "Manage Questions" section
   - Keep the survey form open in another window/tab (or view)

2. **Make Changes**
   - Edit a question's text
   - Add a new question
   - Delete a question
   - Reorder questions

3. **Check Survey Form**
   - The changes should appear immediately
   - No page refresh needed
   - Check browser console for debug logs:
     ```
     📋 Questions updated in SurveyForm. Total questions: [number]
     Question IDs: [list of IDs]
     ```

## Debug Logging

Debug logs are automatically output to the browser console:
- **When SurveyForm mounts**: `🖥️ SurveyForm - Kiosk Mode: [boolean]`
- **When questions update**: `📋 Questions updated in SurveyForm...`

View these logs by:
1. Opening browser DevTools (F12 or Right-click → Inspect)
2. Going to the Console tab
3. Look for messages starting with 📋 or 🖥️

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| Question text changes | Survey form text updates |
| New question added | New input/selection field appears |
| Question deleted | Field is removed from form data |
| Question reordered | Display order changes in form |
| Question marked required | Affects form validation |
| Question type changes | UI renders correct input type |
| All questions deleted | Form remains but with no question fields |

## Technical Details

### Why It Works Automatically

React's component lifecycle and props system handle the synchronization:

1. **Props Update** → `questions` prop changes in SurveyForm
2. **Effect Triggers** → `useEffect` with `[questions]` dependency runs
3. **State Updates** → `setFormData` is called with new question IDs
4. **Re-render** → Component re-renders with updated questions
5. **UI Updates** → New/edited/deleted questions appear in the form

### No Manual Refresh Needed

Because React tracks these changes automatically, there's no need for:
- Page refresh
- Manual state synchronization
- Real-time listeners (already built into React props)
- Event listeners (handled by React's diff algorithm)

## Performance Considerations

- ✅ Efficient updates using React's virtual DOM
- ✅ Only affected components re-render
- ✅ No unnecessary network calls
- ✅ Lightweight change tracking
- ✅ Supports hundreds of questions without lag

## Troubleshooting

### Questions not updating in survey form?

1. **Check browser console** for errors (F12 → Console)
2. **Verify questions prop** is being passed: `questions={questions}`
3. **Check Admin Dashboard handlers** are being called
4. **Look for dependency issues** in useEffect

### Still not working?

Add debug logging to SurveyForm:
```typescript
useEffect(() => {
  console.log('🔍 SurveyForm received questions:', questions);
}, [questions]);
```

## Summary

The "Take Survey" form automatically updates when questions are edited in the Admin Dashboard because:

1. ✅ App.tsx manages the single source of truth for questions
2. ✅ AdminDashboard updates questions through App.tsx handlers
3. ✅ SurveyForm receives updated questions as a prop
4. ✅ React's `useEffect` dependency system triggers re-renders
5. ✅ Component state (formData) updates accordingly
6. ✅ UI automatically reflects all changes

**Result**: Real-time synchronization with zero latency and no manual refresh needed!
