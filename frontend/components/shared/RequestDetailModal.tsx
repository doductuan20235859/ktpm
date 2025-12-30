import { useState } from 'react';
import { X, User, Calendar, MessageSquare, Send } from 'lucide-react';

type RequestStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
type Category = 'ELECTRIC' | 'WATER' | 'SECURITY' | 'CLEANING' | 'ELEVATOR' | 'OTHER';

interface Request {
  id: string;
  ticketCode: string;
  title: string;
  apartmentCode: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  createdDate: string;
  createdBy: string;
  assignedTo?: string;
  description: string;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    date: string;
  }>;
}

interface RequestDetailModalProps {
  request: Request;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RequestDetailModal({ request, isOpen, onClose, onEdit, onDelete }: RequestDetailModalProps) {
  const [status, setStatus] = useState(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(request.notes);

  const getPriorityLabel = (priority: Priority) => {
    const labels = {
      LOW: 'Thấp',
      NORMAL: 'Bình thường',
      HIGH: 'Cao',
      CRITICAL: 'Khẩn cấp',
    };
    return labels[priority];
  };

  const getCategoryLabel = (category: Category) => {
    const labels = {
      ELECTRIC: 'Điện',
      WATER: 'Nước',
      SECURITY: 'An ninh',
      CLEANING: 'Vệ sinh',
      ELEVATOR: 'Thang máy',
      OTHER: 'Khác',
    };
    return labels[category];
  };

  const getStatusLabel = (status: RequestStatus) => {
    const labels = {
      NEW: 'Mới',
      ASSIGNED: 'Đã phân công',
      IN_PROGRESS: 'Đang xử lý',
      RESOLVED: 'Đã giải quyết',
      CLOSED: 'Đã đóng',
    };
    return labels[status];
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: Date.now().toString(),
      author: 'Ban Quản Lý',
      content: newNote,
      date: new Date().toLocaleString('vi-VN'),
    };

    setNotes([...notes, note]);
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-white">Chi Tiết Yêu Cầu</h2>
            <p className="text-sm text-blue-100 mt-1">{request.ticketCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Basic Info */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl text-gray-900 mb-4">{request.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Căn Hộ</p>
                <p className="text-lg text-gray-900">{request.apartmentCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng Mục</p>
                <p className="text-lg text-gray-900">{getCategoryLabel(request.category)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mức Độ Ưu Tiên</p>
                <p className="text-lg text-gray-900">{getPriorityLabel(request.priority)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Người Tạo</p>
                <p className="text-lg text-gray-900">{request.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày Tạo</p>
                <p className="text-lg text-gray-900">{request.createdDate}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Mô Tả Chi Tiết</p>
              <p className="text-gray-900">{request.description}</p>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg text-gray-900 mb-4">Cập Nhật Trạng Thái</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Trạng Thái <span className="text-red-600">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RequestStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="NEW">Mới</option>
                  <option value="ASSIGNED">Đã phân công</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="CLOSED">Đã đóng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phân Công Cho
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Nhập tên người xử lý..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Ghi Chú & Báo Cáo Xử Lý
            </h3>

            {/* Existing Notes */}
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{note.author}</span>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {note.date}
                        </span>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {notes.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Chưa có ghi chú nào</p>
                </div>
              )}
            </div>

            {/* Add New Note */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm text-gray-700 mb-2">
                Thêm Ghi Chú Mới
              </label>
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Nhập ghi chú về tiến độ xử lý..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chỉnh Sửa
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
