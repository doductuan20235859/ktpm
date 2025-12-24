import { useState } from 'react';
import { X, Upload, Plus, Minus, CloudUpload } from 'lucide-react';

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
  photos: File[];
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
    photos: [],
  });

  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    handleReset();
    onClose();
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
      photos: [],
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFormData({ ...formData, photos: [...formData.photos, ...filesArray] });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      setFormData({ ...formData, photos: [...formData.photos, ...filesArray] });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const incrementValue = (field: 'bedrooms' | 'bathrooms') => {
    setFormData({ ...formData, [field]: formData[field] + 1 });
  };

  const decrementValue = (field: 'bedrooms' | 'bathrooms') => {
    if (formData[field] > 0) {
      setFormData({ ...formData, [field]: formData[field] - 1 });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="text-2xl text-gray-900">Add New Unit</h2>
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
                <h3 className="text-sm text-gray-500 mb-4">Identification</h3>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div>
                <h3 className="text-sm text-gray-500 mb-4">Specifications</h3>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementValue('bedrooms')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => incrementValue('bedrooms')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementValue('bathrooms')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => incrementValue('bathrooms')}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Upload Section */}
              <div>
                <h3 className="text-sm text-gray-500 mb-4">Media</h3>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Upload Floor Plan/Photos
                  </label>
                  
                  {/* Upload Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <CloudUpload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>

                  {/* Uploaded Files */}
                  {formData.photos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.photos.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Upload className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
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
