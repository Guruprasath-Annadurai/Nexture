import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { X, Check } from 'lucide-react-native';
import { Button } from '@/components/Button';

interface LivePreviewProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export function LivePreview({ onCapture, onCancel }: LivePreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start webcam stream when component mounts
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      startWebcam();
      return () => {
        stopWebcam();
      };
    }
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 400 },
          height: { ideal: 400 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Could not access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally to create mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        
        // Stop the webcam stream
        stopWebcam();
      }
    }
  };

  const handleConfirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startWebcam();
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Webcam is only available on web platforms.</Text>
        <Button title="Cancel" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Take a Profile Photo</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={startWebcam} />
        </View>
      ) : capturedImage ? (
        <View style={styles.previewContainer}>
          <img 
            src={capturedImage} 
            style={{ 
              width: 300, 
              height: 300, 
              objectFit: 'cover',
              borderRadius: 8,
            }} 
            alt="Captured" 
          />
          
          <View style={styles.captureActions}>
            <Button
              title="Retake"
              onPress={handleRetake}
              icon={<X size={18} color={colors.white} />}
              iconPosition="left"
              variant="outline"
              style={styles.actionButton}
            />
            
            <Button
              title="Use Photo"
              onPress={handleConfirmCapture}
              icon={<Check size={18} color={colors.white} />}
              iconPosition="left"
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.webcamContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ 
              width: 300, 
              height: 300, 
              objectFit: 'cover',
              borderRadius: 8,
              transform: 'scaleX(-1)', // Mirror effect
            }}
          />
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <View style={styles.webcamActions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={styles.actionButton}
            />
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={captureImage}
              disabled={!isStreaming}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.actionButton} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  webcamContainer: {
    width: 300,
    alignItems: 'center',
  },
  previewContainer: {
    width: 300,
    alignItems: 'center',
  },
  webcamActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  captureActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  actionButton: {
    minWidth: 100,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});