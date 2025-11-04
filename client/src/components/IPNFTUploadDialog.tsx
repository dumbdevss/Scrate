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
  AccountBalance as HbarIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { pinataApi, pinataSecret } from '../utils/utils';
import { IPNFTProgressModal, ProgressStep } from './IPNFTProgressModal';
import { useNFTGallery } from '../hooks/useHederaIp';

interface IPNFTUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: IPNFTData) => Promise<void>;
  loading?: boolean;
}

export interface IPNFTData {
  uri: string;
  price: string;
  title: string;
  description: string;
  ipType: string;
  tags: string[];
  contentHash: string;
  metadataBytes: string;
  schemaVersion: string;
  externalUrl: string;
  imageUrl: string;
  agreementPdfUrl: string;
  projectDetails: {
    industry: string;
    organization: string;
    topic: string;
    researchLeadName: string;
    researchLeadEmail: string;
  };
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
    rotation: '0',
    price: '',
    agreementPdfUrl: '',
    // Project details
    industry: 'Pharmaceutical R&D',
    organization: 'Newcastle University, UK',
    topic: 'Aging',
    researchLeadName: 'Chuck Norris',
    researchLeadEmail: 'chuck@norris.com'
  });
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const { uploadIpNft } = useNFTGallery();

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
    console.log(pinataApi);
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

  const initializeProgressSteps = () => {
    const steps: ProgressStep[] = [
      {
        id: 'image-upload',
        title: 'Upload Image to IPFS',
        description: 'Storing your image securely on the InterPlanetary File System via Pinata',
        status: 'pending'
      },
      {
        id: 'metadata-upload',
        title: 'Upload Metadata to IPFS',
        description: 'Creating and storing NFT metadata with all your IP information',
        status: 'pending'
      },
      {
        id: 'hedera-transaction',
        title: 'Submit to Hedera Network',
        description: 'Minting your IPNFT on the Hedera blockchain network',
        status: 'pending'
      }
    ];
    setProgressSteps(steps);
    return steps;
  };

  const updateStepStatus = (stepId: string, status: ProgressStep['status'], errorMessage?: string) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, errorMessage }
        : step
    ));
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
    const steps = initializeProgressSteps();
    setShowProgressModal(true);
    setCurrentStep(0);
    
    try {
      // Upload image to IPFS
      updateStepStatus('image-upload', 'processing');
      const imageUrl = await uploadToIPFS(formData.imageFile);
      updateStepStatus('image-upload', 'completed');
      setCurrentStep(1);
      
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
      updateStepStatus('metadata-upload', 'processing');
      const metadataUri = await uploadMetadataToIPFS(metadata);
      updateStepStatus('metadata-upload', 'completed');
      setCurrentStep(2);

      // Prepare IPNFT data
      const ipnftData: IPNFTData = {
        uri: metadataUri,
        price: formData.price,
        title: formData.title,
        description: formData.description,
        ipType: formData.ipType,
        tags: formData.tags,
        contentHash: imageUrl.split('/').pop() || '',
        metadataBytes: JSON.stringify(metadata),
        schemaVersion: '1.0',
        externalUrl: formData.externalUrl,
        imageUrl: imageUrl,
        agreementPdfUrl: formData.agreementPdfUrl,
        projectDetails: {
          industry: formData.industry,
          organization: formData.organization,
          topic: formData.topic,
          researchLeadName: formData.researchLeadName,
          researchLeadEmail: formData.researchLeadEmail
        },
        xCoordinate: formData.xCoordinate ? parseInt(formData.xCoordinate) : undefined,
        yCoordinate: formData.yCoordinate ? parseInt(formData.yCoordinate) : undefined,
        rotation: parseInt(formData.rotation)
      };

      console.log(ipnftData);
      // Submit to Hedera
      updateStepStatus('hedera-transaction', 'processing');
      await uploadIpNft(ipnftData);
      updateStepStatus('hedera-transaction', 'completed');
      
      // Auto-close progress modal after 2 seconds on success
      setTimeout(() => {
        setShowProgressModal(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error uploading IPNFT:', error);
      
      // Update the current step with error status
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        updateStepStatus(currentStepId, 'error', error instanceof Error ? error.message : 'An unexpected error occurred');
      }
      
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
      rotation: '0',
      price: '',
      agreementPdfUrl: '',
      // Project details
      industry: 'Pharmaceutical R&D',
      organization: 'Newcastle University, UK',
      topic: 'Aging',
      researchLeadName: 'Chuck Norris',
      researchLeadEmail: 'chuck@norris.com'
    });
    setNewTag('');
    setImagePreview(null);
    setUploading(false);
    setShowProgressModal(false);
    setProgressSteps([]);
    setCurrentStep(0);
    onClose();
  };

  const handleProgressModalClose = () => {
    setShowProgressModal(false);
  };

  const handleRetry = () => {
    setShowProgressModal(false);
    // Reset progress state
    setProgressSteps([]);
    setCurrentStep(0);
    // Retry the submission
    handleSubmit();
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

              {/* Pricing Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HbarIcon color="primary" />
                  Pricing
                </Typography>
                
                <TextField
                  label="Price (HBAR)"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  fullWidth
                  type="number"
                  placeholder="0"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">ℏ</InputAdornment>,
                  }}
                  helperText="Set to 0 for free transfer, or specify price in HBAR"
                />
              </Box>

              <Divider />

              {/* Project Details */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  Project Details
                </Typography>
                
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        fullWidth
                        placeholder="e.g., Pharmaceutical R&D"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        fullWidth
                        placeholder="e.g., Newcastle University, UK"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Research Topic"
                        value={formData.topic}
                        onChange={(e) => handleInputChange('topic', e.target.value)}
                        fullWidth
                        placeholder="e.g., Aging"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Research Lead Name"
                        value={formData.researchLeadName}
                        onChange={(e) => handleInputChange('researchLeadName', e.target.value)}
                        fullWidth
                        placeholder="e.g., Chuck Norris"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Research Lead Email"
                        value={formData.researchLeadEmail}
                        onChange={(e) => handleInputChange('researchLeadEmail', e.target.value)}
                        fullWidth
                        type="email"
                        placeholder="e.g., chuck@norris.com"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              <Divider />

              {/* Additional Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon color="primary" />
                  Additional Information
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    label="External URL (Optional)"
                    value={formData.externalUrl}
                    onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                    fullWidth
                    placeholder="https://example.com"
                  />
                  
                  <TextField
                    label="Agreement PDF URL (Optional)"
                    value={formData.agreementPdfUrl}
                    onChange={(e) => handleInputChange('agreementPdfUrl', e.target.value)}
                    fullWidth
                    placeholder="https://ipfs.io/ipfs/... or https://example.com/agreement.pdf"
                    helperText="IPFS link or URL to legal agreement document"
                  />
                </Stack>
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

      {/* Progress Modal */}
      <IPNFTProgressModal
        open={showProgressModal}
        onClose={handleProgressModalClose}
        steps={progressSteps}
        currentStep={currentStep}
        onRetry={handleRetry}
        canClose={progressSteps.some(step => step.status === 'error') || progressSteps.every(step => step.status === 'completed')}
      />

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
