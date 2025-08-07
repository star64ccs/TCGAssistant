import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PlatformUtils from '../utils/platformUtils';

// 平台特定相機組件
const NativeCamera = ({ onCapture, onError }) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      onError(new Error('相機未準備就緒'));
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: PlatformUtils.getPerformanceConfig().imageQuality,
        base64: true,
      });
      onCapture(photo);
    } catch (error) {
      PlatformUtils.handlePlatformError(error, 'NativeCamera.capture');
      onError(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>原生相機組件</Text>
      <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
        <Text style={styles.captureButtonText}>拍照</Text>
      </TouchableOpacity>
    </View>
  );
};

const WebCamera = ({ onCapture, onError }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      PlatformUtils.handlePlatformError(error, 'WebCamera.start');
      onError(error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      onError(new Error('相機未準備就緒'));
      return;
    }

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const photo = {
          uri: URL.createObjectURL(blob),
          width: video.videoWidth,
          height: video.videoHeight,
          base64: canvas.toDataURL('image/jpeg'),
        };
        onCapture(photo);
      }, 'image/jpeg', PlatformUtils.getPerformanceConfig().imageQuality);
    } catch (error) {
      PlatformUtils.handlePlatformError(error, 'WebCamera.capture');
      onError(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={styles.webVideo}
      />
      <canvas ref={canvasRef} style={styles.hiddenCanvas} />
      <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
        <Text style={styles.captureButtonText}>拍照</Text>
      </TouchableOpacity>
    </View>
  );
};

// 主相機組件
const PlatformCamera = ({ onCapture, onError, style, ...props }) => {
  const cameraComponent = PlatformUtils.getPlatformComponent({
    ios: NativeCamera,
    android: NativeCamera,
    web: WebCamera,
    default: NativeCamera,
  });

  const handleCapture = (photo) => {
    if (onCapture) {
      onCapture(photo);
    }
  };

  const handleError = (error) => {
    if (onError) {
      onError(error);
    } else {
      Alert.alert('相機錯誤', error.message);
    }
  };

  const CameraComponent = cameraComponent;

  return (
    <View style={[styles.container, style]}>
      <CameraComponent
        onCapture={handleCapture}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#1A1F71',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  hiddenCanvas: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
});

export default PlatformCamera;
