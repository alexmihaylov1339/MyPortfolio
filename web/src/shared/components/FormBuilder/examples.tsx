/**
 * FormBuilder Usage Examples
 *
 * This file demonstrates how to use the FormBuilder component with different field types.
 */

import { FormBuilder, FieldConfig } from '@shared/components';

// Example 1: Simple text form (like the deck creation form)
const simpleFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Deck Name',
    required: true,
    placeholder: 'Enter deck name',
  },
  {
    type: 'text',
    name: 'description',
    label: 'Description',
    placeholder: 'Optional description',
  },
];

// Example 2: Contact form with various field types
const contactFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'fullName',
    label: 'Full Name',
    required: true,
  },
  {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'you@example.com',
  },
  {
    type: 'select',
    name: 'topic',
    label: 'Topic',
    required: true,
    options: [
      { value: 'general', label: 'General Inquiry' },
      { value: 'support', label: 'Technical Support' },
      { value: 'billing', label: 'Billing Question' },
    ],
  },
  {
    type: 'textarea',
    name: 'message',
    label: 'Message',
    required: true,
    rows: 6,
  },
];

// Example 3: Card creation form with all field types
export const cardFormFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'question',
    label: 'Question',
    required: true,
  },
  {
    type: 'textarea',
    name: 'answer',
    label: 'Answer',
    required: true,
    rows: 4,
  },
  {
    type: 'select',
    name: 'difficulty',
    label: 'Difficulty',
    required: true,
    options: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'Medium' },
      { value: 'hard', label: 'Hard' },
    ],
  },
  {
    type: 'number',
    name: 'points',
    label: 'Points',
    min: 1,
    max: 100,
  },
  {
    type: 'checkbox',
    name: 'isPublic',
    label: 'Make this card public',
  },
];

// Example 4: Survey form with radio buttons
export const surveyFormFields: FieldConfig[] = [
  {
    type: 'radio',
    name: 'experience',
    label: 'How would you rate your experience?',
    required: true,
    options: [
      { value: '5', label: 'Excellent' },
      { value: '4', label: 'Good' },
      { value: '3', label: 'Average' },
      { value: '2', label: 'Poor' },
      { value: '1', label: 'Very Poor' },
    ],
  },
  {
    type: 'checkbox',
    name: 'recommend',
    label: 'Would you recommend this to a friend?',
  },
  {
    type: 'textarea',
    name: 'feedback',
    label: 'Additional Feedback',
    placeholder: 'Tell us what you think...',
  },
];

// Usage example component
export function ExampleForm() {
  const handleSubmit = async (formData: FormData) => {
    // Convert FormData to object for logging
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);

    // Make API call
    // const response = await fetch('/api/endpoint', {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
  };

  return (
    <FormBuilder
      fields={simpleFormFields}
      onSubmit={handleSubmit}
      submitLabel="Submit Form"
      resetOnSubmit={true}
      errorMessage={undefined} // Set error message if needed
    />
  );
}

// Advanced: Dynamic form with error handling
export function AdvancedForm() {
  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Success - form will reset automatically
    } catch (error) {
      console.error('Error:', error);
      // Handle error (you might want to use state for errorMessage)
    }
  };

  return (
    <FormBuilder
      fields={contactFormFields}
      onSubmit={handleSubmit}
      submitLabel="Send Message"
      resetOnSubmit={true}
    />
  );
}
