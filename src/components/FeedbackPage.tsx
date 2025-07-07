import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Send, 
  User, 
  Clock, 
  BookOpen,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Users,
  Target
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { StudentFeedback } from '../types';

export const FeedbackPage: React.FC = () => {
  const { t } = useLanguage();
  const { lessonPlans, addStudentFeedback, getFeedbackForLesson, getFeedbackAnalytics } = useData();
  
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rating, setRating] = useState(0);
  const [clarityRating, setClarityRating] = useState(0);
  const [paceRating, setPaceRating] = useState(0);
  const [engagementRating, setEngagementRating] = useState(0);
  const [understandingRating, setUnderstandingRating] = useState(0);
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [teachingMethodsComments, setTeachingMethodsComments] = useState('');
  const [futureLessonSuggestions, setFutureLessonSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'analytics'>('submit');

  const StarRating: React.FC<{
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
  }> = ({ rating, onRatingChange, label }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`p-1 rounded transition-colors ${
                star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star className="h-6 w-6 fill-current" />
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {rating === 0 ? 'Click to rate' : `${rating} out of 5 stars`}
        </p>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLessonId || rating === 0 || clarityRating === 0 || 
        paceRating === 0 || engagementRating === 0 || understandingRating === 0) {
      alert('Please fill in all required fields and ratings');
      return;
    }

    if (!isAnonymous && !studentName.trim()) {
      alert('Please enter your name or choose anonymous feedback');
      return;
    }

    setIsSubmitting(true);

    const feedback: StudentFeedback = {
      id: Date.now().toString(),
      lessonId: selectedLessonId,
      studentName: isAnonymous ? undefined : studentName,
      rating,
      clarityRating,
      paceRating,
      engagementRating,
      understandingRating,
      areasForImprovement,
      teachingMethodsComments,
      futureLessonSuggestions,
      timestamp: new Date(),
      isAnonymous
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    addStudentFeedback(feedback);
    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form
    setSelectedLessonId('');
    setStudentName('');
    setIsAnonymous(false);
    setRating(0);
    setClarityRating(0);
    setPaceRating(0);
    setEngagementRating(0);
    setUnderstandingRating(0);
    setAreasForImprovement('');
    setTeachingMethodsComments('');
    setFutureLessonSuggestions('');

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectedLesson = lessonPlans.find(lesson => lesson.id === selectedLessonId);
  const lessonFeedback = selectedLessonId ? getFeedbackForLesson(selectedLessonId) : [];
  const analytics = getFeedbackAnalytics(selectedLessonId || undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Feedback System</h1>
          <p className="text-gray-600">Provide feedback on lessons and view analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'submit'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Feedback
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Analytics
          </motion.button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Feedback submitted successfully!</p>
        </motion.div>
      )}

      {activeTab === 'submit' && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            Submit Lesson Feedback
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lesson Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lesson *
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Choose a lesson...</option>
                {lessonPlans.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} - {lesson.grade} ({lesson.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Lesson Info */}
            {selectedLesson && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Selected Lesson Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{selectedLesson.subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{selectedLesson.grade}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">{selectedLesson.duration} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Student Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name {!isAnonymous && '*'}
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={isAnonymous}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter your name"
                  required={!isAnonymous}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Submit anonymous feedback
                </label>
              </div>
            </div>

            {/* Rating Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                label="Overall Teaching Effectiveness *"
              />
              <StarRating
                rating={clarityRating}
                onRatingChange={setClarityRating}
                label="Clarity of Instructions *"
              />
              <StarRating
                rating={paceRating}
                onRatingChange={setPaceRating}
                label="Pace of Lesson Delivery *"
              />
              <StarRating
                rating={engagementRating}
                onRatingChange={setEngagementRating}
                label="Engagement Level of Activities *"
              />
              <StarRating
                rating={understandingRating}
                onRatingChange={setUnderstandingRating}
                label="Understanding of Concepts *"
              />
            </div>

            {/* Text Feedback */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What could be improved in future lessons?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments on Teaching Methods
                </label>
                <textarea
                  value={teachingMethodsComments}
                  onChange={(e) => setTeachingMethodsComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What did you like about the teaching methods used?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggestions for Future Lessons
                </label>
                <textarea
                  value={futureLessonSuggestions}
                  onChange={(e) => setFutureLessonSuggestions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What would you like to see in future lessons?"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                whileTap={!isSubmitting ? { scale: 0.95 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Lesson Filter for Analytics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-secondary" />
              Feedback Analytics
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Lesson (optional)
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Lessons</option>
                {lessonPlans.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} - {lesson.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-blue-800">Overall Rating</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.averageClarityRating.toFixed(1)}
                </div>
                <div className="text-sm text-green-800">Clarity</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.averagePaceRating.toFixed(1)}
                </div>
                <div className="text-sm text-yellow-800">Pace</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.averageEngagementRating.toFixed(1)}
                </div>
                <div className="text-sm text-purple-800">Engagement</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.averageUnderstandingRating.toFixed(1)}
                </div>
                <div className="text-sm text-red-800">Understanding</div>
              </div>
            </div>

            {/* Total Feedback Count */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {analytics.totalFeedbacks} Total Feedback{analytics.totalFeedbacks !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Common Themes */}
            {analytics.totalFeedbacks > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    Common Improvement Areas
                  </h4>
                  <div className="space-y-2">
                    {analytics.commonImprovementAreas.slice(0, 5).map((area, index) => (
                      <div key={index} className="px-3 py-2 bg-red-50 text-red-800 rounded text-sm">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Top Teaching Methods
                  </h4>
                  <div className="space-y-2">
                    {analytics.topTeachingMethods.slice(0, 5).map((method, index) => (
                      <div key={index} className="px-3 py-2 bg-green-50 text-green-800 rounded text-sm">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-500" />
                    Frequent Suggestions
                  </h4>
                  <div className="space-y-2">
                    {analytics.frequentSuggestions.slice(0, 5).map((suggestion, index) => (
                      <div key={index} className="px-3 py-2 bg-blue-50 text-blue-800 rounded text-sm">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {analytics.totalFeedbacks === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No feedback available for the selected criteria</p>
              </div>
            )}
          </div>

          {/* Recent Feedback */}
          {lessonFeedback.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Feedback {selectedLesson && `for "${selectedLesson.title}"`}
              </h3>
              <div className="space-y-4">
                {lessonFeedback.slice(0, 5).map((feedback) => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {feedback.isAnonymous ? 'Anonymous' : feedback.studentName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{feedback.rating}/5</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                      <div>Clarity: {feedback.clarityRating}/5</div>
                      <div>Pace: {feedback.paceRating}/5</div>
                      <div>Engagement: {feedback.engagementRating}/5</div>
                      <div>Understanding: {feedback.understandingRating}/5</div>
                    </div>

                    {feedback.teachingMethodsComments && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Teaching Methods: </span>
                        <span className="text-sm text-gray-600">{feedback.teachingMethodsComments}</span>
                      </div>
                    )}

                    {feedback.areasForImprovement && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Improvements: </span>
                        <span className="text-sm text-gray-600">{feedback.areasForImprovement}</span>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {feedback.timestamp.toLocaleDateString()} at {feedback.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};