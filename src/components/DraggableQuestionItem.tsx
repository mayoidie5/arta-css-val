import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { SurveyQuestion } from '../App';

interface DraggableQuestionItemProps {
  question: SurveyQuestion;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (question: SurveyQuestion) => void;
  onDelete: (question: SurveyQuestion) => void;
}

const ITEM_TYPE = 'QUESTION';

export function DraggableQuestionItem({
  question,
  index,
  moveQuestion,
  onEdit,
  onDelete
}: DraggableQuestionItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { id: question.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  
  preview(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors bg-white"
    >
      <div
        ref={drag}
        className="cursor-move text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline">{question.id.toUpperCase()}</Badge>
          <Badge className={question.category === 'SQD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
            {question.category}
          </Badge>
          {question.required && <Badge className="bg-red-100 text-red-800">Required</Badge>}
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Order: {question.order}
          </Badge>
        </div>
        <p className="text-sm truncate">{question.text}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(question)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
