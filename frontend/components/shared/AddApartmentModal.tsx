import { useState } from 'react';
import { X } from 'lucide-react';

interface AddApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apartment: NewApartmentData) => void;
}

export interface NewApartmentData {
  block: string;
  unitNumber: string;
  floorLevel: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  status: 'Vacant' | 'Occupied' | 'Maintenance';
}

export function AddApartmentModal({ isOpen, onClose, onSave }: AddApartmentModalProps) {
  const [formData, setFormData] = useState<NewApartmentData>({
    block: '',
    unitNumber: '',
    floorLevel: 1,
    area: 0,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Vacant',
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const payload = {
  buildingName: formData.block, // ✅ BẮT BUỘC
  unitNumber: formData.unitNumber,
  floorNumber: formData.floorLevel,
  areaSqm: formData.area,
  status:
    formData.status === 'Vacant'
      ? 'VACANT'
      : formData.status === 'Maintenance'
      ? 'MAINTENANCE'
      : 'OCCUPIED',
};


    const res = await fetch('http://localhost:3001/apartments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Create apartment failed');
    }

    // ✅ gọi callback để page reload data
    onSave(formData);

    handleReset();
    onClose();
  } catch (error) {
    console.error('Create apartment error:', error);
    alert('Tạo căn hộ thất bại');
  }
};


  const handleReset = () => {
    setFormData({
      block: '',
      unitNumber: '',
      floorLevel: 1,
      area: 0,
      bedrooms: 1,
      bathrooms: 1,
      status: 'Vacant',
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Add New Unit</h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Identification Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Block/Building */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Block/Building <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.block}
                      onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select Block</option>
                      <option value="A">Block A</option>
                      <option value="B">Block B</option>
                      <option value="C">Block C</option>
                      <option value="D">Block D</option>
                    </select>
                  </div>

                  {/* Unit Number */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Unit Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.unitNumber}
                      onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                      placeholder="e.g., 102"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Floor Level */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Floor Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.floorLevel}
                      onChange={(e) => setFormData({ ...formData, floorLevel: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Occupancy Status */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Occupancy Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as NewApartmentData['status'] })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="Vacant">Vacant</option>
                    
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Area */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Area (m²) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 68.5"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Create Apartment
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}