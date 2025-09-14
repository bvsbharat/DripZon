import React, { useState } from 'react';
import { User, LogOut, Settings, Edit3, Save, X, Heart, Star, Package, Edit, ChevronRight, Video, Play, Share2, Download, Trash2, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useShopping } from '../contexts/ShoppingContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { generatedVideos, deleteGeneratedVideo, generatedImages, deleteGeneratedImage } = useShopping();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || ''
  });
  const [preferences, setPreferences] = useState({
    favoriteCategories: user?.preferences?.favoriteCategories || [],
    size: user?.preferences?.size || '',
    style: user?.preferences?.style || []
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setPreferences({
      favoriteCategories: user?.preferences?.favoriteCategories || [],
      size: user?.preferences?.size || '',
      style: user?.preferences?.style || []
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setPreferences({
      favoriteCategories: user?.preferences?.favoriteCategories || [],
      size: user?.preferences?.size || '',
      style: user?.preferences?.style || []
    });
    setUpdateMessage('');
  };

  const handleSave = async () => {
    if (!user) return;

    setIsUpdating(true);
    
    // Simulate profile update (replace with actual implementation)
    try {
      // Here you would call your actual update functions
      setIsEditing(false);
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      setUpdateMessage('Failed to update profile');
    }
    setIsUpdating(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleVideoPlay = (videoId: string) => {
    setSelectedVideoId(videoId);
    setIsVideoModalOpen(true);
  };

  const handleVideoShare = async (videoUrl: string, productName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my try-on video for ${productName}`,
          text: `I created this amazing try-on video using AI!`,
          url: videoUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
        handleCopyToClipboard(videoUrl);
      }
    } else {
      handleCopyToClipboard(videoUrl);
    }
  };

  const handleCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setUpdateMessage('Video link copied to clipboard!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleVideoDownload = (videoUrl: string, productName: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `tryon-video-${productName.replace(/\s+/g, '-').toLowerCase()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoDelete = (videoId: string) => {
    deleteGeneratedVideo(videoId);
    setUpdateMessage('Video deleted successfully!');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  const handleImageShare = async (imageUrl: string, productName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my try-on image for ${productName}`,
          text: `I created this amazing try-on image using AI!`,
          url: imageUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
        handleCopyToClipboard(imageUrl);
      }
    } else {
      handleCopyToClipboard(imageUrl);
    }
  };

  const handleImageDownload = (imageUrl: string, productName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `tryon-image-${productName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageDelete = (imageId: string) => {
    deleteGeneratedImage(imageId);
    setUpdateMessage('Image deleted successfully!');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  const handleCategoryToggle = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCategories: preferences.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter((c: string) => c !== category)
        : [...prev.favoriteCategories, category]
    }));
  };

  const handleStyleToggle = (style: string) => {
    setPreferences(prev => ({
      ...prev,
      style: prev.style.includes(style)
        ? prev.style.filter((s: string) => s !== style)
        : [...prev.style, style]
    }));
  };

  if (!user) return null;

  const availableCategories = ['Clothing', 'Bags', 'Shoes', 'Watches', 'Beauty'];
  const availableStyles = ['Casual', 'Formal', 'Sporty', 'Elegant', 'Trendy', 'Classic'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile</h2>
                  <p className="text-white/60 text-sm">Manage your account settings</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-3 text-white/60 hover:text-white transition-all duration-300 rounded-2xl hover:bg-white/10 group"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 group-hover:text-red-400 transition-colors" />
              </motion.button>
            </div>

            {/* Profile Avatar and Basic Info */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center p-1 shadow-2xl">
                  <div className="w-full h-full bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center overflow-hidden border border-white/20">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {!isEditing && (
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{user.name}</h3>
                  <p className="text-white/60 text-sm">{user.email}</p>
                  <p className="text-white/40 text-xs mt-2">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <motion.div 
                      className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-3 border border-red-500/30 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">12</div>
                      <div className="text-xs text-white/60">Favorites</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-3 border border-blue-500/30 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Package className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">8</div>
                      <div className="text-xs text-white/60">Orders</div>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-3 border border-yellow-500/30 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">★</div>
                      <div className="text-xs text-white/60">Premium</div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Update Message */}
            {updateMessage && (
              <motion.div
                className={`mb-6 p-4 rounded-2xl border ${
                  updateMessage.includes('success')
                    ? 'bg-green-500/20 border-green-500/30 text-green-300'
                    : 'bg-red-500/20 border-red-500/30 text-red-300'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm">{updateMessage}</p>
              </motion.div>
            )}

            {/* Edit Form */}
            {isEditing ? (
              <div className="space-y-6 mb-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Basic Information</h4>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Preferences</h4>
                  
                  {/* Favorite Categories */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Favorite Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category: string) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            preferences.favoriteCategories.includes(category)
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                              : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Preferred Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setPreferences(prev => ({ ...prev, size }))}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            preferences.size === size
                              ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                              : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Style Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableStyles.map((style: string) => (
                        <button
                          key={style}
                          onClick={() => handleStyleToggle(style)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            preferences.style.includes(style)
                              ? 'bg-white/30 text-white border border-white/50'
                              : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-green-400/30 backdrop-blur-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: !isUpdating ? 1.02 : 1, y: !isUpdating ? -1 : 0 }}
                    whileTap={{ scale: !isUpdating ? 0.98 : 1 }}
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-400/30 backdrop-blur-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Current Preferences Display */}
                {user.preferences && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Your Preferences</h4>
                    
                    {user.preferences.favoriteCategories.length > 0 && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Favorite Categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.preferences.favoriteCategories.map((category: string) => (
                            <span
                              key={category}
                              className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-400/30"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.preferences.size && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Preferred Size:</p>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm border border-blue-400/30">
                          {user.preferences.size}
                        </span>
                      </div>
                    )}

                    {user.preferences.style.length > 0 && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Style Preferences:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.preferences.style.map((style: string) => (
                            <span
                              key={style}
                              className="px-3 py-1 bg-white/20 text-white rounded-full text-sm border border-white/30"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Generated Images Section */}
                {generatedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">My Try-On Images</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs border border-blue-400/30">
                        {generatedImages.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedImages.slice(0, 6).map((image) => (
                        <motion.div
                          key={image.id}
                          className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Image Display */}
                          <div className="relative aspect-square bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <img
                              src={image.url}
                              alt={image.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="text-white text-center">
                                <p className="text-sm font-medium">{image.productName}</p>
                                <p className="text-xs text-white/80">{image.modelUsed}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Image Info */}
                          <div className="p-3">
                            <h5 className="text-white font-medium text-sm truncate mb-1">
                              {image.productName}
                            </h5>
                            <p className="text-white/60 text-xs mb-3">
                              {new Date(image.createdAt).toLocaleDateString()}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleImageShare(image.url, image.productName)}
                                className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl text-xs font-medium transition-colors border border-blue-400/30 flex items-center justify-center gap-1"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Share2 className="w-3 h-3" />
                                Share
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleImageDownload(image.url, image.productName)}
                                className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-xl text-xs font-medium transition-colors border border-green-400/30 flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Download className="w-3 h-3" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleImageDelete(image.id)}
                                className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl text-xs font-medium transition-colors border border-red-400/30 flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {generatedImages.length > 6 && (
                      <p className="text-white/60 text-sm text-center">
                        Showing 6 of {generatedImages.length} images
                      </p>
                    )}
                  </div>
                )}

                {/* Generated Videos Section */}
                {generatedVideos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white">My Try-On Videos</h4>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs border border-purple-400/30">
                        {generatedVideos.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedVideos.slice(0, 6).map((video) => (
                        <motion.div
                          key={video.id}
                          className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Video Thumbnail */}
                          <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <motion.button
                                onClick={() => handleVideoPlay(video.id)}
                                className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Play className="w-6 h-6 text-white ml-1" />
                              </motion.button>
                            </div>
                            
                            {/* Duration Badge */}
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg text-white text-xs">
                              {video.duration}s
                            </div>
                          </div>
                          
                          {/* Video Info */}
                          <div className="p-3">
                            <h5 className="text-white font-medium text-sm truncate mb-1">
                              {video.productName}
                            </h5>
                            <p className="text-white/60 text-xs mb-3">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleVideoShare(video.url, video.productName)}
                                className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl text-xs font-medium transition-colors border border-blue-400/30 flex items-center justify-center gap-1"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Share2 className="w-3 h-3" />
                                Share
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleVideoDownload(video.url, video.productName)}
                                className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-xl text-xs font-medium transition-colors border border-green-400/30 flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Download className="w-3 h-3" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleVideoDelete(video.id)}
                                className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl text-xs font-medium transition-colors border border-red-400/30 flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {generatedVideos.length > 6 && (
                      <p className="text-white/60 text-sm text-center">
                        Showing 6 of {generatedVideos.length} videos
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="group w-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white py-5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-between shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Edit className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Edit Profile & Preferences</div>
                        <div className="text-sm text-white/70">Update your personal information</div>
                      </div>
                     </div>
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </motion.button>

                  <motion.button
                    onClick={() => {/* Navigate to settings */}}
                    className="group w-full bg-gradient-to-r from-gray-600 via-slate-700 to-gray-800 hover:from-gray-700 hover:via-slate-800 hover:to-gray-900 text-white py-5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-between shadow-2xl hover:shadow-gray-500/25 border border-gray-400/30 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Settings</div>
                        <div className="text-sm text-white/70">Manage app preferences</div>
                      </div>
                     </div>
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </motion.button>

                   <motion.button
                     onClick={handleLogout}
                    className="group w-full bg-gradient-to-r from-red-500 via-rose-600 to-red-700 hover:from-red-600 hover:via-rose-700 hover:to-red-800 text-white py-5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-between shadow-2xl hover:shadow-red-500/25 border border-red-400/30 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Sign Out</div>
                        <div className="text-sm text-white/70">End your current session</div>
                      </div>
                     </div>
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </motion.button>
                 </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      
      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && selectedVideoId && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              className="relative bg-black rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              {/* Video Player */}
              <video
                src={generatedVideos.find(v => v.id === selectedVideoId)?.url}
                className="w-full h-auto"
                controls
                autoPlay
                loop
              />
              
              {/* Video Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {generatedVideos.find(v => v.id === selectedVideoId)?.productName}
                </h3>
                <p className="text-white/60 text-sm">
                  Generated on {generatedVideos.find(v => v.id === selectedVideoId) && 
                    new Date(generatedVideos.find(v => v.id === selectedVideoId)!.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default UserProfile;