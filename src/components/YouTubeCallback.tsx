import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Youtube, CheckCircle, XCircle } from 'lucide-react';
import { youtubeClient } from '../lib/youtube';
import { useAuth } from '../contexts/AuthContext';

export default function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting your YouTube account...');

  useEffect(() => {
    handleCallback();
  }, [searchParams, session]);

  const handleCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('YouTube connection was cancelled or failed.');
      setTimeout(() => navigate('/setup'), 3000);
      return;
    }

    if (!code || !state || !session?.user?.id) {
      setStatus('error');
      setMessage('Invalid callback parameters.');
      setTimeout(() => navigate('/setup'), 3000);
      return;
    }

    try {
      await youtubeClient.handleCallback(code, session.user.id);

      setStatus('success');
      setMessage('YouTube connected successfully! Syncing your data...');

      await youtubeClient.syncData(session.user.id);

      setTimeout(() => navigate('/setup'), 2000);
    } catch (err) {
      console.error('YouTube callback error:', err);
      setStatus('error');
      setMessage('Failed to complete YouTube connection.');
      setTimeout(() => navigate('/setup'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 ${
            status === 'processing' ? 'bg-red-100 dark:bg-red-900/30' :
            status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            {status === 'processing' && (
              <Youtube className="w-12 h-12 text-red-600 animate-pulse" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'processing' && 'Connecting YouTube'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {status === 'processing' && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-red-600 h-full animate-pulse" style={{ width: '60%' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
