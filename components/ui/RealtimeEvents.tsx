"use client";

import { useState } from 'react';
import { useRealtime, RealtimeEvent } from '@/hooks/use-realtime';

interface RealtimeEventsProps {
  userId: string;
  userRole?: 'user' | 'admin' | 'superadmin';
  maxEvents?: number;
  showConnectionStatus?: boolean;
}

export default function RealtimeEvents({ 
  userId, 
  userRole = 'user', 
  maxEvents = 10,
  showConnectionStatus = true 
}: RealtimeEventsProps) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const {
    events,
    isConnected,
    requestNotificationPermission,
    clearEvents,
    getEventsByPriority,
    connectionStatus
  } = useRealtime({
    userId,
    userRole,
    enableNotifications: true,
    enableInvestments: true,
    enableAdminEvents: userRole === 'admin' || userRole === 'superadmin'
  });

  // Filter events based on priority
  const filteredEvents = filter === 'all' 
    ? events 
    : getEventsByPriority(filter);

  // Limit events to display
  const displayEvents = showAll ? filteredEvents : filteredEvents.slice(0, maxEvents);

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'investment': return '💰';
      case 'payment': return '💳';
      case 'notification': return '🔔';
      case 'user_registration': return '👤';
      case 'system_alert': return '⚠️';
      default: return '📡';
    }
  };

  const getPriorityColor = (priority: RealtimeEvent['priority']) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: 0,
            color: '#1f2937'
          }}>
            Real-time Events
          </h3>
          {showConnectionStatus && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: isConnected ? '#16a34a' : '#dc2626'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#16a34a' : '#dc2626'
              }} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '12px'
            }}
          >
            <option value="all">All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
          
          <button
            onClick={clearEvents}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#dc2626'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {displayEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
          No real-time events yet
          <br />
          <small>Events will appear here as they happen</small>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {displayEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderBottom: '1px solid #f3f4f6',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ fontSize: '20px' }}>
                {getEventIcon(event.type)}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    textTransform: 'capitalize'
                  }}>
                    {event.type.replace('_', ' ')}
                  </span>
                  
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#fff',
                    background: getPriorityColor(event.priority)
                  }}>
                    {event.priority}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  {(() => {
                    try {
                      const dataString = typeof event.data === 'string' 
                        ? event.data 
                        : JSON.stringify(event.data);
                      return dataString.substring(0, 100) + (dataString.length > 100 ? '...' : '');
                    } catch (error) {
                      return 'Data not available';
                    }
                  })()}
                </div>
                
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af'
                }}>
                  {formatTime(event.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isConnected && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>⚠️ Real-time connection lost</strong>
          <br />
          <small>Events will be updated when connection is restored</small>
        </div>
      )}

      {showConnectionStatus && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#f8fafc',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <div>Subscriptions: {connectionStatus.subscriptions}</div>
          <div>Events processed: {connectionStatus.events}</div>
        </div>
      )}
    </div>
  );
} 