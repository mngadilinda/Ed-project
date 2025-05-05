// src/components/EducatorPendingApproval.jsx
const EducatorPendingApproval = () => (
    <div className="text-center p-8">
      <AcademicCapIcon className="mx-auto h-12 w-12 text-yellow-500" />
      <h3 className="mt-4 text-lg font-medium">Your educator account is pending approval</h3>
      <p className="mt-2 text-gray-600">
        Our admin team will review your application shortly. You'll receive an email once approved.
      </p>
    </div>
  );