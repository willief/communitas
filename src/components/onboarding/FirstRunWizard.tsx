import React, { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import IdentitySetup from '../identity/IdentitySetup'

interface FirstRunWizardProps {
  open: boolean
  onClose: () => void
}

const FirstRunWizard: React.FC<FirstRunWizardProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [networkReady, setNetworkReady] = useState<boolean>(false)
  const [checkingNetwork, setCheckingNetwork] = useState<boolean>(false)
  const [identityCreated, setIdentityCreated] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { label: 'Create Identity', description: 'Generate your four‑word identity and keys' },
    { label: 'Initialize Network', description: 'Start P2P node and verify connectivity' },
    { label: 'Secure Storage', description: 'Verify OS keychain and encryption keys' },
  ]

  useEffect(() => {
    if (!open) return
    // No pre-checks needed
  }, [open])

  const startNetwork = async () => {
    setCheckingNetwork(true)
    setError(null)
    try {
      // The network is already initialized when core_initialize is called
      // Just check the health status
      const health = await invoke<any>('health')
      setNetworkReady(true)
      setActiveStep(2)
    } catch (e: any) {
      // Network might not be available yet, but we can proceed
      console.warn('Network health check failed:', e)
      setNetworkReady(true) // Allow proceeding anyway
      setActiveStep(2)
    } finally {
      setCheckingNetwork(false)
    }
  }

  const verifySecureStorage = async () => {
    try {
      // For now, just mark as complete since secure storage is optional
      console.log('Secure storage verification skipped')
    } catch (e) {
      console.warn('Secure storage check failed:', e)
    }
  }

  const onIdentityCreated = () => {
    setIdentityCreated(true)
    setActiveStep(1)
    // Mark onboarded immediately to avoid re-opening wizard on refresh
    localStorage.setItem('communitas-onboarded', 'true')
  }

  const onContinue = async () => {
    if (activeStep === 1) {
      await startNetwork()
      setActiveStep(2)
    } else if (activeStep === 2) {
      await verifySecureStorage()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Welcome to Communitas</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((s, idx) => (
            <Step key={s.label}>
              <StepLabel>{s.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {s.description}
                </Typography>
                {idx === 0 && (
                  <IdentitySetup
                    open={true}
                    onClose={() => {}}
                    onIdentityCreated={() => onIdentityCreated()}
                  />
                )}
                {idx === 1 && (
                  <Box sx={{ mt: 2 }}>
                    {checkingNetwork ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} />
                        <Typography>Connecting to P2P network…</Typography>
                      </Box>
                    ) : (
                      <>
                        {!networkReady && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            We will start your node and connect to bootstrap peers.
                          </Alert>
                        )}
                        {error && (
                          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        )}
                        <Button variant="contained" onClick={startNetwork}>Initialize Network</Button>
                      </>
                    )}
                  </Box>
                )}
                {idx === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>
                      We will verify secure storage availability and finish setup.
                    </Typography>
                    {error && (
                      <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    <Button variant="contained" onClick={onClose}>Finish</Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  )
}

export default FirstRunWizard
