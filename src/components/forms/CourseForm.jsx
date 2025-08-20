import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Row, Col, DatePicker, InputNumber, Checkbox, message } from 'antd';
import { CourseService } from '../../services';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

// Course Validator - Matching the guide exactly
class CourseValidator {
  static validateCourseData(courseData) {
    const errors = {};
    
    // Required fields validation
    if (!courseData.course_name?.trim()) {
      errors.course_name = 'Course name is required';
    }
    
    if (!courseData.course_code?.trim()) {
      errors.course_code = 'Course code is required';
    }
    
    if (!courseData.instructor?.trim()) {
      errors.instructor = 'Instructor is required';
    }
    
    if (!courseData.start_date) {
      errors.start_date = 'Start date is required';
    }
    
    if (!courseData.end_date) {
      errors.end_date = 'End date is required';
    }
    
    if (!courseData.registration_deadline) {
      errors.registration_deadline = 'Registration deadline is required';
    }
    
    // Date validation
    if (courseData.start_date && courseData.end_date) {
      const startDate = new Date(courseData.start_date);
      const endDate = new Date(courseData.end_date);
      
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    if (courseData.registration_deadline && courseData.start_date) {
      const regDeadline = new Date(courseData.registration_deadline);
      const startDate = new Date(courseData.start_date);
      
      if (regDeadline >= startDate) {
        errors.registration_deadline = 'Registration deadline must be before start date';
      }
    }
    
    // Numeric validation
    if (courseData.cost && isNaN(parseFloat(courseData.cost))) {
      errors.cost = 'Cost must be a valid number';
    }
    
    if (courseData.training_hours && (!Number.isInteger(Number(courseData.training_hours)) || Number(courseData.training_hours) <= 0)) {
      errors.training_hours = 'Training hours must be a positive integer';
    }
    
    if (courseData.max_participants && (!Number.isInteger(Number(courseData.max_participants)) || Number(courseData.max_participants) <= 0)) {
      errors.max_participants = 'Max participants must be a positive integer';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

const CourseForm = ({ courseId = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    instructor: '',
    cost: '0.00',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    training_hours: '',
    description: '',
    max_participants: '30',
    type: 'course',
    status: 'draft',
    is_featured: false,
    is_public: true,
    prerequisites: '',
    materials_provided: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!courseId);

  // Load course data for editing
  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const course = await CourseService.getCourse(courseId);
      setFormData(course);
    } catch (error) {
      message.error('فشل في تحميل بيانات الدورة');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    const validation = CourseValidator.validateCourseData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      message.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      let result;
      if (isEditing) {
        result = await CourseService.updateCourse(courseId, formData);
        message.success('تم تحديث الدورة بنجاح');
      } else {
        result = await CourseService.createCourse(formData);
        message.success('تم إنشاء الدورة بنجاح');
      }

      onSuccess && onSuccess(result);
    } catch (error) {
      try {
        const errorData = JSON.parse(error.message);
        setErrors(errorData);
        message.error('فشل في حفظ الدورة');
      } catch {
        setErrors({ general: 'حدث خطأ أثناء حفظ الدورة' });
        message.error('حدث خطأ أثناء حفظ الدورة');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <Card loading>جاري تحميل بيانات الدورة...</Card>;
  }

  return (
    <Card title={isEditing ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}>
      {errors.general && (
        <div style={{ color: 'red', marginBottom: '16px', padding: '8px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
          {errors.general}
        </div>
      )}

      <Form layout="vertical">
        {/* Basic Information */}
        <Card type="inner" title="المعلومات الأساسية" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item 
                label="اسم الدورة *" 
                validateStatus={errors.course_name ? 'error' : ''}
                help={errors.course_name}
              >
                <Input
                  value={formData.course_name}
                  onChange={(e) => handleChange('course_name', e.target.value)}
                  placeholder="أدخل اسم الدورة"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label="كود الدورة *"
                validateStatus={errors.course_code ? 'error' : ''}
                help={errors.course_code}
              >
                <Input
                  value={formData.course_code}
                  onChange={(e) => handleChange('course_code', e.target.value)}
                  placeholder="مثال: AGR101"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="المدرب *"
                validateStatus={errors.instructor ? 'error' : ''}
                help={errors.instructor}
              >
                <Input
                  value={formData.instructor}
                  onChange={(e) => handleChange('instructor', e.target.value)}
                  placeholder="اسم المدرب"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="نوع الدورة">
                <Select
                  value={formData.type}
                  onChange={(value) => handleChange('type', value)}
                >
                  <Option value="course">دورة</Option>
                  <Option value="workshop">ورشة عمل</Option>
                  <Option value="seminar">ندوة</Option>
                  <Option value="summer_training">تدريب صيفي</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Schedule */}
        <Card type="inner" title="الجدولة" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item 
                label="تاريخ البداية *"
                validateStatus={errors.start_date ? 'error' : ''}
                help={errors.start_date}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  value={formData.start_date ? moment(formData.start_date) : null}
                  onChange={(date) => handleChange('start_date', date ? date.format('YYYY-MM-DD') : '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label="تاريخ النهاية *"
                validateStatus={errors.end_date ? 'error' : ''}
                help={errors.end_date}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  value={formData.end_date ? moment(formData.end_date) : null}
                  onChange={(date) => handleChange('end_date', date ? date.format('YYYY-MM-DD') : '')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label="آخر موعد للتسجيل *"
                validateStatus={errors.registration_deadline ? 'error' : ''}
                help={errors.registration_deadline}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  value={formData.registration_deadline ? moment(formData.registration_deadline) : null}
                  onChange={(date) => handleChange('registration_deadline', date ? date.format('YYYY-MM-DD') : '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="ساعات التدريب *"
            validateStatus={errors.training_hours ? 'error' : ''}
            help={errors.training_hours}
          >
            <InputNumber
              style={{ width: '100%' }}
              value={formData.training_hours}
              onChange={(value) => handleChange('training_hours', value)}
              min={1}
              placeholder="عدد ساعات التدريب"
            />
          </Form.Item>
        </Card>

        {/* Pricing & Capacity */}
        <Card type="inner" title="السعر والسعة" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="التكلفة"
                validateStatus={errors.cost ? 'error' : ''}
                help={errors.cost}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={formData.cost}
                  onChange={(value) => handleChange('cost', value)}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="الحد الأقصى للمشاركين"
                validateStatus={errors.max_participants ? 'error' : ''}
                help={errors.max_participants}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  value={formData.max_participants}
                  onChange={(value) => handleChange('max_participants', value)}
                  min={1}
                  placeholder="30"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Course Details */}
        <Card type="inner" title="تفاصيل الدورة" style={{ marginBottom: '16px' }}>
          <Form.Item label="الوصف">
            <TextArea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="وصف محتوى الدورة والأهداف وما سيتعلمه الطلاب..."
            />
          </Form.Item>

          <Form.Item label="المتطلبات المسبقة">
            <TextArea
              rows={3}
              value={formData.prerequisites}
              onChange={(e) => handleChange('prerequisites', e.target.value)}
              placeholder="اذكر أي متطلبات مسبقة أو شروط لهذه الدورة..."
            />
          </Form.Item>

          <Form.Item label="المواد المقدمة">
            <TextArea
              rows={3}
              value={formData.materials_provided}
              onChange={(e) => handleChange('materials_provided', e.target.value)}
              placeholder="اذكر المواد والموارد أو الأدوات المقدمة للطلاب..."
            />
          </Form.Item>

          <Form.Item label="العلامات">
            <Input
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="علامات مفصولة بفواصل (مثال: برمجة، تطوير ويب، جافاسكريبت)"
            />
          </Form.Item>
        </Card>

        {/* Settings */}
        <Card type="inner" title="الإعدادات" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="الحالة">
                <Select
                  value={formData.status}
                  onChange={(value) => handleChange('status', value)}
                >
                  <Option value="draft">مسودة</Option>
                  <Option value="published">منشورة</Option>
                  <Option value="inactive">غير نشطة</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item>
                <Checkbox
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                >
                  دورة مميزة
                </Checkbox>
                <br />
                <Checkbox
                  checked={formData.is_public}
                  onChange={(e) => handleChange('is_public', e.target.checked)}
                >
                  دورة عامة
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Form Actions */}
        <Row justify="end" gutter={16}>
          <Col>
            <Button onClick={onCancel} disabled={loading}>
              إلغاء
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? 'تحديث الدورة' : 'إنشاء الدورة'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default CourseForm;
