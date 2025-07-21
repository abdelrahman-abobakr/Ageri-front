import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateCoursePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form validation schema
  const schema = yup.object().shape({
    title: yup.string().required("Title is required").max(200),
    description: yup.string().required("Description is required"),
    short_description: yup.string().max(300),
    course_code: yup.string().required("Course code is required").max(20),
    credits: yup.number().min(1).max(10).nullable(),
    duration_hours: yup.number().required().min(0),
    training_type: yup.string().required(),
    difficulty_level: yup.string().required(),
    instructor: yup.array().min(1, "Select at least one instructor"),
    department: yup.number().nullable(),
    start_date: yup.date().required(),
    end_date: yup
      .date()
      .required()
      .min(yup.ref("start_date"), "End date must be after start date"),
    registration_deadline: yup.date().required(),
    max_participants: yup.number().min(0),
    min_participants: yup.number().min(0),
    price: yup
      .string()
      .matches(/^-?\d{0,8}(?:\.\d{0,2})?$/, "Invalid price format"),
    is_free: yup.boolean(),
    status: yup.string().required(),
    is_featured: yup.boolean(),
    is_public: yup.boolean(),
    prerequisites: yup.string(),
    materials_provided: yup.string(),
    featured_image: yup.string().url().nullable(),
    syllabus: yup.string().url().nullable(),
    tags: yup.string().max(500),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      is_free: false,
      is_featured: false,
      is_public: true,
      credits: 1,
      difficulty_level: "beginner",
      training_type: "course",
      status: "draft",
    },
  });

  const isFree = watch("is_free");

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        start_date: formatDate(data.start_date),
        end_date: formatDate(data.end_date),
        registration_deadline: formatDate(data.registration_deadline),
      };

       await axios.post(
        "http://localhost:8000/api/training/api/courses/",
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Course created successfully!");
    } catch (error) {
      console.log("🔍 API Error Details:", error.response?.data);
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable form components
  const FormSection = ({ title, children }) => (
    <div className="form-section">
      <h2>{title}</h2>
      {children}
    </div>
  );

  const FormRow = ({ children }) => <div className="form-row">{children}</div>;

  const InputField = ({ name, label, control, error, ...props }) => (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input {...field} id={name} className="form-control" {...props} />
        )}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );

  const SelectField = ({ name, label, control, error, options, ...props }) => (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select {...field} id={name} className="form-control" {...props}>
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );

  const DateField = ({ name, label, control, error, ...props }) => (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            {...props}
          />
        )}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );

  const TextAreaField = ({ name, label, control, error, ...props }) => (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea {...field} id={name} className="form-control" {...props} />
        )}
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );

  const ToggleField = ({ name, label, control, setValue }) => {
    const value = control._formValues[name];
    return (
      <div className="form-group toggle-group">
        <label>{label}</label>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id={name}
            checked={value}
            onChange={() => setValue(name, !value)}
          />
          <label htmlFor={name} className="toggle-label">
            <span className="toggle-inner" />
            <span className="toggle-switch" />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-course-page">
      <style>{`
        .admin-course-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          color: #2c3e50;
          font-size: 2rem;
          margin: 0;
        }
        .btn-back {
          background-color: #e2e8f0;
          color: #4a5568;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-back:hover {
          background-color: #cbd5e0;
        }
        .form-section {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        .form-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #4a5568;
        }
        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
        textarea.form-control {
          min-height: 100px;
          resize: vertical;
        }
        .toggle-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-label {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        .toggle-label:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .toggle-label {
          background-color: #4299e1;
        }
        input:checked + .toggle-label:before {
          transform: translateX(26px);
        }
        .has-error .form-control {
          border-color: #e53e3e;
        }
        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn-primary {
          background-color: #4299e1;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #3182ce;
        }
        .btn-primary:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        .btn-secondary {
          background-color: #e2e8f0;
          color: #4a5568;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-secondary:hover {
          background-color: #cbd5e0;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column;
          }
          .btn-primary, .btn-secondary {
            width: 100%;
          }
        }
      `}</style>

      <div className="page-header">
        <h1>Create New Course</h1>
        <button className="btn-back" onClick={() => window.history.back()}>
          Back to Courses
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="course-form">
        {/* Basic Information Section */}
        <FormSection title="Basic Information">
          <FormRow>
            <InputField
              name="title"
              label="Course Title*"
              control={control}
              error={errors.title}
              placeholder="Introduction to React"
              required
            />
            <InputField
              name="course_code"
              label="Course Code*"
              control={control}
              error={errors.course_code}
              placeholder="CS101"
              required
            />
          </FormRow>
          <FormRow>
            <SelectField
              name="training_type"
              label="Training Type*"
              control={control}
              error={errors.training_type}
              options={[
                { value: "course", label: "Course" },
                { value: "summer_training", label: "Summer Training" },
                { value: "public_service", label: "Public Service" },
                { value: "workshop", label: "Workshop" },
                { value: "seminar", label: "Seminar" },
              ]}
              required
            />
            <SelectField
              name="difficulty_level"
              label="Difficulty Level*"
              control={control}
              error={errors.difficulty_level}
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
              required
            />
          </FormRow>
          <TextAreaField
            name="short_description"
            label="Short Description"
            control={control}
            error={errors.short_description}
            placeholder="Brief description for course listings (max 300 chars)"
            maxLength={300}
            rows={3}
          />
          <TextAreaField
            name="description"
            label="Full Description*"
            control={control}
            error={errors.description}
            placeholder="Detailed course description"
            required
            rows={5}
          />
        </FormSection>
        {/* Schedule & Duration Section */}
        <FormSection title="Schedule & Duration">
          <FormRow>
            <DateField
              name="start_date"
              label="Start Date*"
              control={control}
              error={errors.start_date}
              required
            />
            <DateField
              name="end_date"
              label="End Date*"
              control={control}
              error={errors.end_date}
              required
            />
          </FormRow>
          <FormRow>
            <DateField
              name="registration_deadline"
              label="Registration Deadline*"
              control={control}
              error={errors.registration_deadline}
              required
            />
            <InputField
              name="duration_hours"
              label="Duration (hours)*"
              control={control}
              error={errors.duration_hours}
              type="number"
              min={0}
              required
            />
          </FormRow>
          <FormRow>
            <InputField
              name="credits"
              label="Credits"
              control={control}
              error={errors.credits}
              type="number"
              min={1}
              max={10}
            />
          </FormRow>
        </FormSection>
        {/* Pricing & Enrollment Section */}
        <FormSection title="Pricing & Enrollment">
          <FormRow>
            <ToggleField
              name="is_free"
              label="Free Course"
              control={control}
              setValue={setValue}
            />
            {!isFree && (
              <InputField
                name="price"
                label="Price"
                control={control}
                error={errors.price}
                placeholder="0.00"
                type="text"
              />
            )}
          </FormRow>
          <FormRow>
            <InputField
              name="min_participants"
              label="Minimum Participants"
              control={control}
              error={errors.min_participants}
              type="number"
              min={0}
            />
            <InputField
              name="max_participants"
              label="Maximum Participants"
              control={control}
              error={errors.max_participants}
              type="number"
              min={0}
            />
          </FormRow>
        </FormSection>
        {/* Additional Information Section */}
        <FormSection title="Additional Information">
          <TextAreaField
            name="prerequisites"
            label="Prerequisites"
            control={control}
            error={errors.prerequisites}
            placeholder="Course prerequisites and requirements"
            rows={3}
          />
          <TextAreaField
            name="materials_provided"
            label="Materials Provided"
            control={control}
            error={errors.materials_provided}
            placeholder="Materials and resources provided"
            rows={3}
          />
          <InputField
            name="featured_image"
            label="Featured Image URL"
            control={control}
            error={errors.featured_image}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
          <InputField
            name="syllabus"
            label="Syllabus URL"
            control={control}
            error={errors.syllabus}
            placeholder="https://example.com/syllabus.pdf"
            type="url"
          />
          <InputField
            name="tags"
            label="Tags"
            control={control}
            error={errors.tags}
            placeholder="Comma-separated tags (e.g., react, javascript, web)"
            maxLength={500}
          />
        </FormSection>
        {/* Status & Visibility Section */}
        <FormSection title="Status & Visibility">
          <FormRow>
          <SelectField
  name="status"
  label="Status*"
  control={control}
  error={errors.status}
  options={[
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]}
  required
/>

            
          </FormRow>
         
        </FormSection>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
          <button type="button" className="btn-secondary">
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;
