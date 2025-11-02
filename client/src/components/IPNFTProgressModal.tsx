import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Stack,
  Fade,
  Chip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Error as ErrorIcon,
  CloudUpload as PinataIcon,
  AccountBalance as HederaIcon,
  Close as CloseIcon,
  Refresh as RetryIcon
} from '@mui/icons-material';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  icon?: React.ReactNode;
  errorMessage?: string;
}

interface IPNFTProgressModalProps {
  open: boolean;
  onClose: () => void;
  steps: ProgressStep[];
  currentStep: number;
  onRetry?: () => void;
  canClose?: boolean;
}

export const IPNFTProgressModal: React.FC<IPNFTProgressModalProps> = ({
  open,
  onClose,
  steps,
  currentStep,
  onRetry,
  canClose = false
}) => {
  const getStepIcon = (step: ProgressStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
    } else if (step.status === 'error') {
      return <ErrorIcon sx={{ color: '#f44336', fontSize: 28 }} />;
    } else if (step.status === 'processing') {
      return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <LinearProgress
            variant="indeterminate"
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              '& .MuiLinearProgress-bar': {
                borderRadius: '50%',
              }
            }}
          />
        </Box>
      );
    } else {
      return <PendingIcon sx={{ color: '#9e9e9e', fontSize: 28 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'processing':
        return '#2196f3';
      case 'error':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const hasError = steps.some(step => step.status === 'error');
  const isCompleted = steps.every(step => step.status === 'completed');

  return (
    <Dialog
      open={open}
      onClose={canClose ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#1a1a1a',
          color: 'white',
          minHeight: '400px'
        }
      }}
      disableEscapeKeyDown={!canClose}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: isCompleted ? '#4caf50' : hasError ? '#f44336' : '#2196f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isCompleted ? (
                <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
              ) : hasError ? (
                <ErrorIcon sx={{ color: 'white', fontSize: 24 }} />
              ) : (
                <PinataIcon sx={{ color: 'white', fontSize: 24 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {isCompleted ? 'IPNFT Created Successfully!' : hasError ? 'Creation Failed' : 'Creating IPNFT...'}
              </Typography>
              <Typography variant="body2" color="#fff">
                {isCompleted 
                  ? 'Your intellectual property NFT has been minted on Hedera'
                  : hasError 
                  ? 'There was an error during the creation process'
                  : 'Please wait while we process your IPNFT'
                }
              </Typography>
            </Box>
          </Box>
          {canClose && (
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Overall Progress */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="#fff">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="#fff">
              {Math.round(getProgressPercentage())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#333',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: isCompleted ? '#4caf50' : hasError ? '#f44336' : '#2196f3'
              }
            }}
          />
        </Box>

        {/* Steps */}
        <Stack spacing={3}>
          {steps.map((step, index) => (
            <Fade in={true} timeout={300 + index * 100} key={step.id}>
              <Box>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box sx={{ mt: 0.5 }}>
                    {getStepIcon(step, index)}
                  </Box>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h6" fontWeight="medium">
                        {step.title}
                      </Typography>
                      <Chip
                        label={step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(step.status),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="#fff" mb={1}>
                      {step.description}
                    </Typography>
                    
                    {step.status === 'processing' && (
                      <LinearProgress
                        variant="indeterminate"
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: '#333',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: '#2196f3'
                          }
                        }}
                      />
                    )}
                    
                    {step.status === 'error' && step.errorMessage && (
                      <Box
                        sx={{
                          bgcolor: '#2d1b1b',
                          border: '1px solid #f44336',
                          borderRadius: 1,
                          p: 2,
                          mt: 1
                        }}
                      >
                        <Typography variant="body2" color="#f44336">
                          {step.errorMessage}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      height: 24,
                      bgcolor: step.status === 'completed' ? '#4caf50' : '#333',
                      ml: '13px',
                      mt: 1
                    }}
                  />
                )}
              </Box>
            </Fade>
          ))}
        </Stack>

        {/* Action Buttons */}
        {(hasError || isCompleted) && (
          <Box display="flex" justifyContent="center" gap={2} mt={4}>
            {hasError && onRetry && (
              <Box
                component="button"
                onClick={onRetry}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 1.5,
                  bgcolor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: 'medium',
                  '&:hover': {
                    bgcolor: '#1976d2'
                  }
                }}
              >
                <RetryIcon sx={{ fontSize: 20 }} />
                Try Again
              </Box>
            )}
            {(isCompleted || canClose) && (
              <Box
                component="button"
                onClick={onClose}
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: isCompleted ? '#4caf50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontWeight: 'medium',
                  '&:hover': {
                    bgcolor: isCompleted ? '#388e3c' : '#555'
                  }
                }}
              >
                {isCompleted ? 'Continue' : 'Close'}
              </Box>
            )}
          </Box>
        )}

        {/* Helpful Tips */}
        {!isCompleted && !hasError && (
          <Box
            sx={{
              bgcolor: '#1a2332',
              border: '1px solid #2196f3',
              borderRadius: 2,
              p: 2,
              mt: 3
            }}
          >
            <Typography variant="body2" color="#2196f3" fontWeight="medium" mb={1}>
              💡 What's happening?
            </Typography>
            <Typography variant="body2" color="#fff" sx={{ fontSize: '0.85rem' }}>
              We're securely storing your content on IPFS and minting your IPNFT on the Hedera network. 
              This process ensures your intellectual property is permanently recorded on the blockchain.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
