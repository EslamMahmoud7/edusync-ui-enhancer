import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizDTO } from '../types/quiz';

interface QuizModelsSectionProps {
  quiz: QuizDTO;
  onModelAdded: () => void; 
}

export default function QuizModelsSection({ quiz }: QuizModelsSectionProps) {
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  const toggleModel = (modelId: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  if (!quiz.quizModels || quiz.quizModels.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Circle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">No models uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quiz.quizModels.map((model) => (
        <div key={model.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <Button
            variant="ghost"
            onClick={() => toggleModel(model.id)}
            className="w-full justify-between p-4 h-auto"
          >
            <span className="font-medium">{model.modelIdentifier}</span>
            {expandedModels.has(model.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {expandedModels.has(model.id) && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {model.questions && model.questions.length > 0 ? (
                <div className="space-y-4">
                  {model.questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="font-medium mb-2">
                        Question {qIndex + 1}: {question.text}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Points: {question.points}
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center p-2 rounded ${
                              option.isCorrect
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                : 'bg-white dark:bg-gray-700'
                            }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-gray-400" />
                            )}
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No questions in this model</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}