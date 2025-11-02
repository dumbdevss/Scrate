import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Tag as TagIcon,
  Link as LinkIcon,
  AccountBalance as HbarIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { pinataApi, pinataSecret } from '../utils/utils';

interface IPNFTUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: IPNFTData) => Promise<void>;
  loading?: boolean;
}

export interface IPNFTData {
  uri: string;
  title: string;
  description: string;
  ipType: string;
  tags: string[];
  contentHash: string;
  metadataBytes: string;
  schemaVersion: string;
  externalUrl: string;
  imageUrl: string;
  xCoordinate?: number;
  yCoordinate?: number;
  rotation?: number;
}

const IP_TYPES = [
  'Digital Art',
  'Photography',
  'Music',
  'Video',
  'Document',
  'Code',
  'Patent',
  'Trademark',
  'Copyright',
  'Other'
];

export const IPNFTUploadDialog: React.FC<IPNFTUploadDialogProps> = ({
  open,
  onClose,
  onUpload,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ipType: 'Digital Art',
    tags: [] as string[],
    externalUrl: '',
    imageFile: null as File | null,
    xCoordinate: '',
    yCoordinate: '',
    rotation: '0'
  });
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formDataIPFS = new FormData();
    formDataIPFS.append('file', file);

    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formDataIPFS,
      headers: {
        pinata_api_key: pinataApi,
        pinata_secret_api_key: pinataSecret,
        'Content-Type': 'multipart/form-data',
      },
    });

    return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
  };

  const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: metadata,
      headers: {
        pinata_api_key: pinataApi,
        pinata_secret_api_key: pinataSecret,
        'Content-Type': 'application/json',
      },
    });

    return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.imageFile) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(formData.imageFile);
      
      // Create metadata object
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: imageUrl,
        external_url: formData.externalUrl,
        attributes: [
          {
            trait_type: 'IP Type',
            value: formData.ipType
          },
          {
            trait_type: 'Tags',
            value: formData.tags.join(', ')
          },
          {
            trait_type: 'Schema Version',
            value: '1.0'
          }
        ],
        properties: {
          ipType: formData.ipType,
          tags: formData.tags,
          creator: 'Meta Gallery User',
          createdAt: new Date().toISOString()
        }
      };

      // Upload metadata to IPFS
      const metadataUri = await uploadMetadataToIPFS(metadata);

      // Prepare IPNFT data
      const ipnftData: IPNFTData = {
        uri: metadataUri,
        title: formData.title,
        description: formData.description,
        ipType: formData.ipType,
        tags: formData.tags,
        contentHash: imageUrl.split('/').pop() || '',
        metadataBytes: JSON.stringify(metadata),
        schemaVersion: '1.0',
        externalUrl: formData.externalUrl,
        imageUrl: imageUrl,
        xCoordinate: formData.xCoordinate ? parseInt(formData.xCoordinate) : undefined,
        yCoordinate: formData.yCoordinate ? parseInt(formData.yCoordinate) : undefined,
        rotation: parseInt(formData.rotation)
      };

      await onUpload(ipnftData);
      handleClose();
    } catch (error) {
      console.error('Error uploading IPNFT:', error);
      toast.error('Failed to upload IPNFT');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      ipType: 'Digital Art',
      tags: [],
      externalUrl: '',
      imageFile: null,
      xCoordinate: '',
      yCoordinate: '',
      rotation: '0'
    });
    setNewTag('');
    setImagePreview(null);
    setUploading(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <ImageIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Create IPNFT
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Grid container spacing={3}>
          {/* Image Upload Section */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                textAlign: 'center',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50'
                }
              }}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {imagePreview ? (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click to change image
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Upload Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to select or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max size: 10MB
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Form Fields */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="primary" />
                  Basic Information
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    fullWidth
                    required
                    placeholder="Enter a descriptive title for your IPNFT"
                  />
                  
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe your intellectual property..."
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>IP Type</InputLabel>
                    <Select
                      value={formData.ipType}
                      onChange={(e) => handleInputChange('ipType', e.target.value)}
                      label="IP Type"
                    >
                      {IP_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              <Divider />

              {/* Tags Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TagIcon color="primary" />
                  Tags
                </Typography>
                
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    size="small"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="e.g., abstract, digital, art"
                  />
                  <Button
                    variant="outlined"
                    onClick={addTag}
                    startIcon={<AddIcon />}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<DeleteIcon />}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Divider />

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon color="primary" />
                  Additional Information
                </Typography>
                
                <TextField
                  label="External URL (Optional)"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                  fullWidth
                  placeholder="https://example.com"
                />
              </Box>

              <Divider />

              {/* Position Settings */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Gallery Position (Optional)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="X Coordinate"
                      value={formData.xCoordinate}
                      onChange={(e) => handleInputChange('xCoordinate', e.target.value)}
                      type="number"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Y Coordinate"
                      value={formData.yCoordinate}
                      onChange={(e) => handleInputChange('yCoordinate', e.target.value)}
                      type="number"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Rotation"
                      value={formData.rotation}
                      onChange={(e) => handleInputChange('rotation', e.target.value)}
                      type="number"
                      size="small"
                      inputProps={{ min: 0, max: 360 }}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Leave empty for automatic positioning
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Cost Information */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Transaction Cost:</strong> Minting this IPNFT will require a small amount of HBAR for gas fees.
            The exact amount depends on network conditions.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={uploading || loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={uploading || loading || !formData.title.trim() || !formData.imageFile}
          startIcon={uploading || loading ? <CircularProgress size={20} /> : <HbarIcon />}
          sx={{ minWidth: 120 }}
        >
          {uploading ? 'Uploading...' : loading ? 'Minting...' : 'Create IPNFT'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
