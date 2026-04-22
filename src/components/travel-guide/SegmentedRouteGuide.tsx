import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NC } from '../../constants/theme';
import { ClayCard } from '../clay/ClayCard';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

export type TransportMode = 'walking' | 'auto' | 'cab' | 'train' | 'flight' | 'metro' | 'bus' | 'ferry';

export interface RouteSegment {
  id: string;
  mode: TransportMode;
  title: string;
  subtitle?: string;
  detail: string;
  instruction: string;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  duration: string;
  distance?: string;
  cost: string;
  status?: 'pending' | 'active' | 'completed' | 'delayed';
  etaBuffer?: string;
  alternatives?: AlternativeOption[];
  // Detailed instructions for turn-by-turn
  steps?: TurnByTurnStep[];
  // Booking info
  bookingInfo?: {
    provider: string;
    pnr?: string;
    seatInfo?: string;
    platform?: string;
    terminal?: string;
    gate?: string;
  };
}

export interface AlternativeOption {
  id: string;
  mode: TransportMode;
  title: string;
  duration: string;
  cost: string;
  eta: string;
  pros: string[];
  cons: string[];
}

export interface TurnByTurnStep {
  id: string;
  instruction: string;
  distance: string;
  duration: string;
  maneuver: 'straight' | 'left' | 'right' | 'uturn' | 'roundabout' | 'arrive' | 'depart';
  icon?: string;
}

export interface RouteGuideData {
  segments: RouteSegment[];
  totalDuration: string;
  totalDistance: string;
  totalCost: string;
  departureTime: string;
  arrivalTime: string;
  alternatives: RouteAlternative[];
}

export interface RouteAlternative {
  id: string;
  name: string;
  duration: string;
  cost: string;
  modes: TransportMode[];
  isRecommended?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
}

interface SegmentedRouteGuideProps {
  visible: boolean;
  onClose: () => void;
  from: string;
  to: string;
  data?: RouteGuideData;
  persona?: 'family' | 'solo' | 'business' | 'spiritual';
  onStartNavigation?: () => void;
}

const MODE_ICONS: Record<TransportMode, string> = {
  walking: 'walk',
  auto: 'car',
  cab: 'taxi',
  train: 'train',
  flight: 'airplane',
  metro: 'subway',
  bus: 'bus',
  ferry: 'boat',
};

const MODE_COLORS: Record<TransportMode, string> = {
  walking: '#4CAF50',
  auto: '#FF9800',
  cab: '#FF5722',
  train: '#2196F3',
  flight: '#9C27B0',
  metro: '#00BCD4',
  bus: '#795548',
  ferry: '#009688',
};

export function SegmentedRouteGuide({
  visible,
  onClose,
  from,
  to,
  data,
  persona = 'family',
  onStartNavigation,
}: SegmentedRouteGuideProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'alternatives'>('overview');
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [showTurnByTurn, setShowTurnByTurn] = useState<string | null>(null);

  // Default sample data if none provided
  const guideData: RouteGuideData = data || getDefaultRouteData(from, to);

  const toggleSegment = useCallback((id: string) => {
    setExpandedSegment(expanded => expanded === id ? null : id);
  }, []);

  const handleSelectAlternative = useCallback((alt: RouteAlternative) => {
    setSelectedAlternative(alt.id);
    // Would trigger route recalculation here
  }, []);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={s.overlay}>
        <Animated.View style={s.sheet}>
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.routeHeader}>
              <Text style={s.fromTo}>{from}</Text>
              <Ionicons name="arrow-forward" size={20} color={NC.primary} style={s.arrow} />
              <Text style={s.fromTo}>{to}</Text>
            </View>
            <Text style={s.subtitle}>Multi-Modal Journey Guide</Text>

            {/* Trip Stats */}
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Ionicons name="time-outline" size={16} color={NC.primary} />
                <Text style={s.statValue}>{guideData.totalDuration}</Text>
                <Text style={s.statLabel}>Total Time</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Ionicons name="cash-outline" size={16} color={NC.primary} />
                <Text style={s.statValue}>{guideData.totalCost}</Text>
                <Text style={s.statLabel}>Est. Cost</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Ionicons name="swap-horizontal-outline" size={16} color={NC.primary} />
                <Text style={s.statValue}>{guideData.segments.length}</Text>
                <Text style={s.statLabel}>Segments</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={s.tabBar}>
            {[
              { id: 'overview', label: 'Overview', icon: 'map-outline' },
              { id: 'detailed', label: 'Step-by-Step', icon: 'list-outline' },
              { id: 'alternatives', label: 'Routes', icon: 'git-branch-outline' },
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[s.tab, activeTab === tab.id && s.tabActive]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.id ? '#FFF' : NC.primary} />
                <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'overview' && (
              <OverviewTab
                data={guideData}
                expandedSegment={expandedSegment}
                onToggleSegment={toggleSegment}
                persona={persona}
              />
            )}

            {activeTab === 'detailed' && (
              <DetailedTab
                data={guideData}
                onShowTurnByTurn={setShowTurnByTurn}
              />
            )}

            {activeTab === 'alternatives' && (
              <AlternativesTab
                alternatives={guideData.alternatives}
                selected={selectedAlternative}
                onSelect={handleSelectAlternative}
              />
            )}

            {/* Start Navigation Button */}
            <TouchableOpacity style={s.startNavBtn} onPress={onStartNavigation}>
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={s.startNavText}>Start Navigation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>Close Guide</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>

      {/* Turn-by-Turn Modal */}
      {showTurnByTurn && (
        <TurnByTurnModal
          segment={guideData.segments.find(s => s.id === showTurnByTurn)!}
          onClose={() => setShowTurnByTurn(null)}
        />
      )}
    </Modal>
  );
}

// Overview Tab - The Accordion Path
function OverviewTab({
  data,
  expandedSegment,
  onToggleSegment,
  persona,
}: {
  data: RouteGuideData;
  expandedSegment: string | null;
  onToggleSegment: (id: string) => void;
  persona: string;
}) {
  return (
    <View style={s.overviewContainer}>
      {/* Timeline */}
      <View style={s.timeline}>
        {/* Liquid Thread - Vertical connecting line */}
        <View style={s.liquidThread} />

        {data.segments.map((seg, index) => {
          const isExpanded = expandedSegment === seg.id;
          const isFirst = index === 0;
          const isLast = index === data.segments.length - 1;

          return (
            <View key={seg.id} style={s.segmentContainer}>
              {/* Time indicator */}
              <View style={s.timeColumn}>
                <Text style={s.timeText}>{seg.startTime}</Text>
                {!isLast && <View style={s.timeLine} />}
              </View>

              {/* Mode Icon */}
              <TouchableOpacity
                style={[
                  s.modeIcon,
                  { backgroundColor: MODE_COLORS[seg.mode] },
                  seg.status === 'active' && s.activeModeIcon,
                ]}
                onPress={() => onToggleSegment(seg.id)}
              >
                <Ionicons name={MODE_ICONS[seg.mode] as any} size={20} color="#FFF" />
                {seg.status === 'active' && (
                  <View style={s.activePulse}>
                    <View style={s.pulseRing} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Content Card */}
              <View style={s.segmentContent}>
                <ClayCard variant="white" style={s.segmentCard}>
                  <TouchableOpacity onPress={() => onToggleSegment(seg.id)}>
                    <View style={s.segmentHeader}>
                      <View style={s.segmentTitleRow}>
                        <Text style={s.segmentTitle}>{seg.title}</Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={NC.primary}
                        />
                      </View>
                      <Text style={s.segmentSubtitle}>{seg.from} → {seg.to}</Text>
                    </View>

                    {/* Summary Row */}
                    <View style={s.segmentSummary}>
                      <View style={s.summaryItem}>
                        <Ionicons name="time-outline" size={12} color={NC.onSurfaceVariant} />
                        <Text style={s.summaryText}>{seg.duration}</Text>
                      </View>
                      <View style={s.summaryItem}>
                        <Ionicons name="cash-outline" size={12} color={NC.onSurfaceVariant} />
                        <Text style={s.summaryText}>{seg.cost}</Text>
                      </View>
                      {seg.distance && (
                        <View style={s.summaryItem}>
                          <Ionicons name="resize-outline" size={12} color={NC.onSurfaceVariant} />
                          <Text style={s.summaryText}>{seg.distance}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <View style={s.expandedContent}>
                      <View style={s.divider} />

                      {/* Instruction */}
                      <Text style={s.instructionLabel}>Instructions</Text>
                      <Text style={s.instructionText}>{seg.instruction}</Text>

                      {/* Detail */}
                      <Text style={s.detailLabel}>Details</Text>
                      <Text style={s.detailText}>{seg.detail}</Text>

                      {/* Booking Info */}
                      {seg.bookingInfo && (
                        <View style={s.bookingInfo}>
                          <Text style={s.bookingLabel}>Booking Info</Text>
                          <View style={s.bookingRow}>
                            <Text style={s.bookingKey}>Provider:</Text>
                            <Text style={s.bookingValue}>{seg.bookingInfo.provider}</Text>
                          </View>
                          {seg.bookingInfo.pnr && (
                            <View style={s.bookingRow}>
                              <Text style={s.bookingKey}>PNR:</Text>
                              <Text style={s.bookingValue}>{seg.bookingInfo.pnr}</Text>
                            </View>
                          )}
                          {seg.bookingInfo.seatInfo && (
                            <View style={s.bookingRow}>
                              <Text style={s.bookingKey}>Seat:</Text>
                              <Text style={s.bookingValue}>{seg.bookingInfo.seatInfo}</Text>
                            </View>
                          )}
                          {seg.bookingInfo.platform && (
                            <View style={s.bookingRow}>
                              <Text style={s.bookingKey}>Platform:</Text>
                              <Text style={s.bookingValue}>{seg.bookingInfo.platform}</Text>
                            </View>
                          )}
                          {seg.bookingInfo.terminal && (
                            <View style={s.bookingRow}>
                              <Text style={s.bookingKey}>Terminal:</Text>
                              <Text style={s.bookingValue}>{seg.bookingInfo.terminal}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Buffer Time Alert */}
                      {seg.etaBuffer && (
                        <View style={s.bufferAlert}>
                          <Ionicons name="alert-circle" size={16} color="#FF9800" />
                          <Text style={s.bufferText}>{seg.etaBuffer}</Text>
                        </View>
                      )}

                      {/* Alternatives */}
                      {seg.alternatives && seg.alternatives.length > 0 && (
                        <View style={s.alternativesSection}>
                          <Text style={s.alternativesLabel}>Alternative Options</Text>
                          {seg.alternatives.map(alt => (
                            <TouchableOpacity key={alt.id} style={s.alternativeItem}>
                              <View style={s.altHeader}>
                                <Ionicons name={MODE_ICONS[alt.mode] as any} size={14} color={MODE_COLORS[alt.mode]} />
                                <Text style={s.altTitle}>{alt.title}</Text>
                                <Text style={s.altCost}>{alt.cost}</Text>
                              </View>
                              <View style={s.altMeta}>
                                <Text style={s.altEta}>{alt.eta}</Text>
                                <Text style={s.altDuration}>{alt.duration}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </ClayCard>
              </View>
            </View>
          );
        })}

        {/* End time */}
        <View style={s.endTimeContainer}>
          <View style={s.timeColumn}>
            <Text style={s.timeText}>{data.arrivalTime}</Text>
          </View>
          <View style={[s.modeIcon, s.destinationIcon]}>
            <Ionicons name="location" size={20} color="#FFF" />
          </View>
          <View style={s.destinationCard}>
            <Text style={s.destinationText}>Arrive at {data.segments[data.segments.length - 1]?.to || 'Destination'}</Text>
          </View>
        </View>
      </View>

      {/* Persona-specific alerts */}
      {persona === 'family' && (
        <ClayCard variant="green" style={s.personaAlert}>
          <Ionicons name="people" size={20} color={NC.primary} />
          <View style={s.alertContent}>
            <Text style={s.alertTitle}>Family Travel Tip</Text>
            <Text style={s.alertText}>
              Platform 4 is 500m away. Suggesting slow-walk route for elders.
              Consider booking porter services at major stations.
            </Text>
          </View>
        </ClayCard>
      )}

      {persona === 'solo' && (
        <ClayCard variant="white" style={s.personaAlert}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <View style={s.alertContent}>
            <Text style={s.alertTitle}>Solo Traveler Safety</Text>
            <Text style={s.alertText}>
              Safe zones marked along route. 24/7 helpline: 1800-XXX-XXXX
            </Text>
          </View>
        </ClayCard>
      )}
    </View>
  );
}

// Detailed Tab - Turn-by-turn instructions
function DetailedTab({
  data,
  onShowTurnByTurn,
}: {
  data: RouteGuideData;
  onShowTurnByTurn: (segmentId: string) => void;
}) {
  return (
    <View style={s.detailedContainer}>
      {data.segments.map((seg, index) => (
        <ClayCard key={seg.id} variant="white" style={s.detailedCard}>
          <View style={s.detailedHeader}>
            <View style={[s.detailedIcon, { backgroundColor: MODE_COLORS[seg.mode] }]}>
              <Ionicons name={MODE_ICONS[seg.mode] as any} size={18} color="#FFF" />
            </View>
            <View style={s.detailedTitleCol}>
              <Text style={s.detailedTitle}>{seg.title}</Text>
              <Text style={s.detailedSubtitle}>{seg.from} → {seg.to}</Text>
            </View>
          </View>

          {/* Quick Steps Preview */}
          {seg.steps && seg.steps.length > 0 && (
            <View style={s.stepsPreview}>
              {seg.steps.slice(0, 3).map((step, i) => (
                <View key={step.id} style={s.previewStep}>
                  <View style={s.previewStepNum}>
                    <Text style={s.previewStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.previewStepText} numberOfLines={1}>{step.instruction}</Text>
                  <Text style={s.previewStepDist}>{step.distance}</Text>
                </View>
              ))}
              {seg.steps.length > 3 && (
                <TouchableOpacity
                  style={s.viewAllSteps}
                  onPress={() => onShowTurnByTurn(seg.id)}
                >
                  <Text style={s.viewAllStepsText}>
                    View all {seg.steps.length} steps
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={NC.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* No steps available message */}
          {(!seg.steps || seg.steps.length === 0) && (
            <View style={s.noSteps}>
              <Text style={s.noStepsText}>Turn-by-turn directions available during navigation</Text>
            </View>
          )}
        </ClayCard>
      ))}
    </View>
  );
}

// Alternatives Tab - Route options
function AlternativesTab({
  alternatives,
  selected,
  onSelect,
}: {
  alternatives: RouteAlternative[];
  selected: string | null;
  onSelect: (alt: RouteAlternative) => void;
}) {
  return (
    <View style={s.alternativesContainer}>
      <Text style={s.alternativesTitle}>Choose Your Route</Text>

      {alternatives.map((alt, index) => (
        <TouchableOpacity
          key={alt.id}
          style={[
            s.routeOption,
            selected === alt.id && s.routeOptionSelected,
            alt.isRecommended && s.routeOptionRecommended,
          ]}
          onPress={() => onSelect(alt)}
        >
          {/* Badges */}
          <View style={s.routeBadges}>
            {alt.isRecommended && (
              <View style={[s.badge, s.recommendedBadge]}>
                <Text style={s.badgeText}>Recommended</Text>
              </View>
            )}
            {alt.isFastest && (
              <View style={[s.badge, s.fastestBadge]}>
                <Text style={s.badgeText}>Fastest</Text>
              </View>
            )}
            {alt.isCheapest && (
              <View style={[s.badge, s.cheapestBadge]}>
                <Text style={s.badgeText}>Cheapest</Text>
              </View>
            )}
            {selected === alt.id && (
              <View style={[s.badge, s.selectedBadge]}>
                <Ionicons name="checkmark" size={12} color="#FFF" />
                <Text style={s.badgeText}>Selected</Text>
              </View>
            )}
          </View>

          {/* Route Name */}
          <Text style={s.routeOptionName}>{alt.name}</Text>

          {/* Mode Icons */}
          <View style={s.routeModes}>
            {alt.modes.map((mode, i) => (
              <View key={i} style={s.modeBadge}>
                <Ionicons name={MODE_ICONS[mode] as any} size={14} color={MODE_COLORS[mode]} />
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={s.routeStats}>
            <View style={s.routeStat}>
              <Ionicons name="time-outline" size={14} color={NC.onSurfaceVariant} />
              <Text style={s.routeStatValue}>{alt.duration}</Text>
            </View>
            <View style={s.routeStat}>
              <Ionicons name="cash-outline" size={14} color={NC.onSurfaceVariant} />
              <Text style={s.routeStatValue}>{alt.cost}</Text>
            </View>
          </View>

          {/* Selection indicator */}
          <View style={[s.selectionIndicator, selected === alt.id && s.selectionIndicatorActive]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Turn-by-Turn Modal
function TurnByTurnModal({
  segment,
  onClose,
}: {
  segment: RouteSegment;
  onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={s.tbtOverlay}>
        <View style={s.tbtSheet}>
          <View style={s.tbtHeader}>
            <TouchableOpacity onPress={onClose} style={s.tbtBack}>
              <Ionicons name="arrow-back" size={24} color={NC.primary} />
            </TouchableOpacity>
            <Text style={s.tbtTitle}>{segment.title}</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={s.tbtSubtitle}>{segment.from} → {segment.to}</Text>

          <ScrollView contentContainerStyle={s.tbtScroll}>
            {segment.steps?.map((step, index) => (
              <View key={step.id} style={s.tbtStep}>
                <View style={s.tbtStepNum}>
                  <Text style={s.tbtStepNumText}>{index + 1}</Text>
                </View>
                <View style={s.tbtStepContent}>
                  <View style={s.tbtManeuver}>
                    <Ionicons
                      name={getManeuverIcon(step.maneuver) as any}
                      size={20}
                      color={NC.primary}
                    />
                  </View>
                  <View style={s.tbtStepTextCol}>
                    <Text style={s.tbtStepInstruction}>{step.instruction}</Text>
                    <View style={s.tbtStepMeta}>
                      <Text style={s.tbtStepDistance}>{step.distance}</Text>
                      <Text style={s.tbtStepDuration}>· {step.duration}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getManeuverIcon(maneuver: string): string {
  switch (maneuver) {
    case 'left': return 'arrow-back';
    case 'right': return 'arrow-forward';
    case 'uturn': return 'return-up-back';
    case 'roundabout': return 'sync';
    case 'arrive': return 'flag';
    case 'depart': return 'navigate';
    default: return 'arrow-up';
  }
}

// Default route data generator
function getDefaultRouteData(from: string, to: string): RouteGuideData {
  return {
    segments: [
      {
        id: 'seg-1',
        mode: 'walking',
        title: 'First Mile',
        from: 'Home',
        to: 'Auto Stand',
        startTime: '06:00 AM',
        endTime: '06:10 AM',
        duration: '10 min',
        distance: '800m',
        cost: 'Free',
        instruction: 'Head north for 200m towards the main gate, then turn right.',
        detail: 'Walk to the corner auto stand near the main gate. Auto drivers are available 24/7.',
        status: 'completed',
        steps: [
          { id: 's1', instruction: 'Head north on Main Street', distance: '200m', duration: '2 min', maneuver: 'depart' },
          { id: 's2', instruction: 'Turn right at the main gate', distance: '150m', duration: '2 min', maneuver: 'right' },
          { id: 's3', instruction: 'Continue straight to auto stand', distance: '450m', duration: '6 min', maneuver: 'straight' },
          { id: 's4', instruction: 'Arrive at auto stand', distance: '0m', duration: '0 min', maneuver: 'arrive' },
        ],
      },
      {
        id: 'seg-2',
        mode: 'auto',
        title: 'Local Link',
        from: 'Auto Stand',
        to: 'Guntur Railway Station',
        startTime: '06:10 AM',
        endTime: '06:30 AM',
        duration: '20 min',
        distance: '5 km',
        cost: '₹150',
        instruction: 'Take an auto to Guntur Railway Station.',
        detail: 'Auto ride to railway station. Drivers usually charge ₹150-200 for this route.',
        status: 'completed',
        etaBuffer: 'Arrive 30 mins early for boarding',
        alternatives: [
          {
            id: 'alt-1',
            mode: 'cab',
            title: 'Uber/Ola Cab',
            duration: '15 min',
            cost: '₹250',
            eta: '06:25 AM',
            pros: ['AC comfort', 'GPS tracked', 'Safer'],
            cons: ['Higher cost'],
          },
          {
            id: 'alt-2',
            mode: 'bus',
            title: 'City Bus 42A',
            duration: '35 min',
            cost: '₹20',
            eta: '06:45 AM',
            pros: ['Cheapest', 'Frequent'],
            cons: ['Crowded', 'Slower'],
          },
        ],
      },
      {
        id: 'seg-3',
        mode: 'train',
        title: 'The Spine',
        subtitle: '12723 Telangana Express',
        from: 'Guntur Junction',
        to: 'New Delhi Railway Station',
        startTime: '07:00 AM',
        endTime: '07:00 AM (+1)',
        duration: '24 hrs',
        distance: '1,756 km',
        cost: '₹2,450 (3AC)',
        instruction: 'Board train 12723 Telangana Express at Platform 4.',
        detail: 'Coach S4, Seats 11-22. Train runs daily. Pantry car available.',
        status: 'active',
        etaBuffer: 'Buffer: 45 min before connecting flight',
        bookingInfo: {
          provider: 'IRCTC',
          pnr: '2487192389',
          seatInfo: '3AC, Coach S4, Seats 11-22',
          platform: '4',
        },
      },
      {
        id: 'seg-4',
        mode: 'flight',
        title: 'The Bridge',
        subtitle: 'Singapore Airlines SQ423',
        from: 'Delhi (DEL)',
        to: 'Singapore (SIN)',
        startTime: '09:30 PM',
        endTime: '05:30 AM (+1)',
        duration: '5.5 hrs',
        distance: '4,150 km',
        cost: '₹18,500',
        instruction: 'Check-in at Terminal 3, Gate 12.',
        detail: 'Singapore Airlines direct flight. Arrive 3 hours early for international. Immigration and customs at Changi Airport.',
        status: 'pending',
        etaBuffer: 'Arrive 3 hrs early for intl check-in',
        bookingInfo: {
          provider: 'Singapore Airlines',
          pnr: '7X9K2L',
          seatInfo: 'Economy, Row 15, Seats A-C',
          terminal: '3',
          gate: '12',
        },
      },
      {
        id: 'seg-5',
        mode: 'metro',
        title: 'Last Mile',
        from: 'Changi Airport',
        to: 'Marina Bay',
        startTime: '06:00 AM',
        endTime: '06:45 AM',
        duration: '45 min',
        distance: '25 km',
        cost: 'S$2 (₹125)',
        instruction: 'Take the Green Line (East West Line) towards Tuas Link.',
        detail: 'Exit at Raffles Place MRT (EW14/NS26). Transfer from Green to Red line if needed.',
        status: 'pending',
        alternatives: [
          {
            id: 'alt-3',
            mode: 'cab',
            title: 'Airport Taxi',
            duration: '25 min',
            cost: 'S$25 (₹1,500)',
            eta: '06:25 AM',
            pros: ['Direct', 'Comfortable with luggage'],
            cons: ['Expensive'],
          },
        ],
        steps: [
          { id: 's5', instruction: 'Follow signs to MRT Station at Terminal 3', distance: '300m', duration: '5 min', maneuver: 'straight' },
          { id: 's6', instruction: 'Buy EZ-Link card or single trip ticket', distance: '-', duration: '5 min', maneuver: 'straight' },
          { id: 's7', instruction: 'Board Green Line (EW) towards Tuas Link', distance: '-', duration: '35 min', maneuver: 'depart' },
          { id: 's8', instruction: 'Alight at Raffles Place Station', distance: '-', duration: '0 min', maneuver: 'arrive' },
          { id: 's9', instruction: 'Exit at Gate B towards Marina Bay', distance: '200m', duration: '5 min', maneuver: 'straight' },
        ],
      },
    ],
    totalDuration: '26h 45m',
    totalDistance: '6,031 km',
    totalCost: '₹21,225',
    departureTime: '06:00 AM',
    arrivalTime: '06:45 AM (+2)',
    alternatives: [
      {
        id: 'route-1',
        name: 'Via Hyderabad Flight',
        duration: '12h 30m',
        cost: '₹24,500',
        modes: ['auto', 'flight', 'metro'],
        isFastest: true,
      },
      {
        id: 'route-2',
        name: 'All Train + Ferry',
        duration: '72h',
        cost: '₹8,500',
        modes: ['train', 'bus', 'ferry'],
        isCheapest: true,
      },
      {
        id: 'route-3',
        name: 'Via Chennai & Port Blair',
        duration: '48h',
        cost: '₹15,000',
        modes: ['train', 'flight', 'ferry'],
        isRecommended: true,
      },
    ],
  };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: NC.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: '92%',
    minHeight: '70%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 15,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fromTo: {
    fontSize: 22,
    fontWeight: '900',
    color: NC.onSurface,
  },
  arrow: {
    marginHorizontal: 12,
  },
  subtitle: {
    fontSize: 14,
    color: NC.onSurfaceVariant,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: NC.onSurface,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: NC.onSurfaceVariant,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(165,214,167,0.3)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
  },
  tabActive: {
    backgroundColor: NC.primary,
    borderColor: NC.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: NC.primary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Overview Tab Styles
  overviewContainer: {
    paddingTop: 10,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 8,
  },
  liquidThread: {
    position: 'absolute',
    left: 52,
    top: 30,
    bottom: 80,
    width: 3,
    backgroundColor: 'rgba(46,125,50,0.2)',
    borderRadius: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '800',
    color: NC.onSurfaceVariant,
  },
  timeLine: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(165,214,167,0.4)',
    marginTop: 4,
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  activeModeIcon: {
    shadowColor: 'rgba(46,125,50,0.5)',
    shadowRadius: 12,
  },
  activePulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#4CAF50',
    opacity: 0.5,
  },
  segmentContent: {
    flex: 1,
    marginLeft: 6,
  },
  segmentCard: {
    padding: 14,
  },
  segmentHeader: {
    marginBottom: 8,
  },
  segmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: NC.onSurface,
  },
  segmentSubtitle: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
    marginTop: 2,
  },
  segmentSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 11,
    color: NC.onSurfaceVariant,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(165,214,167,0.3)',
    marginVertical: 12,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: NC.primary,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: NC.onSurface,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: NC.primary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: NC.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
  },
  bookingInfo: {
    backgroundColor: '#F1F8F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bookingLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: NC.primary,
    marginBottom: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bookingKey: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
    width: 80,
  },
  bookingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: NC.onSurface,
    flex: 1,
  },
  bufferAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  bufferText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '700',
    flex: 1,
  },
  alternativesSection: {
    marginTop: 8,
  },
  alternativesLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: NC.onSurfaceVariant,
    marginBottom: 8,
  },
  alternativeItem: {
    backgroundColor: '#F1F8F2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  altHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  altTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: NC.onSurface,
    flex: 1,
  },
  altCost: {
    fontSize: 13,
    fontWeight: '900',
    color: NC.primary,
  },
  altMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginLeft: 22,
  },
  altEta: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '700',
  },
  altDuration: {
    fontSize: 11,
    color: NC.onSurfaceVariant,
  },
  endTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  destinationIcon: {
    backgroundColor: '#E53935',
  },
  destinationCard: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  destinationText: {
    fontSize: 14,
    fontWeight: '800',
    color: NC.onSurface,
  },
  personaAlert: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NC.onSurface,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
    lineHeight: 18,
  },

  // Detailed Tab Styles
  detailedContainer: {
    gap: 12,
  },
  detailedCard: {
    padding: 16,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedTitleCol: {
    flex: 1,
  },
  detailedTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: NC.onSurface,
  },
  detailedSubtitle: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
  },
  stepsPreview: {
    gap: 8,
  },
  previewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F8F2',
    borderRadius: 10,
    padding: 10,
  },
  previewStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NC.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewStepNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
  },
  previewStepText: {
    flex: 1,
    fontSize: 13,
    color: NC.onSurface,
    fontWeight: '600',
  },
  previewStepDist: {
    fontSize: 11,
    color: NC.onSurfaceVariant,
    fontWeight: '700',
  },
  viewAllSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  viewAllStepsText: {
    fontSize: 13,
    fontWeight: '800',
    color: NC.primary,
  },
  noSteps: {
    padding: 16,
    backgroundColor: '#F1F8F2',
    borderRadius: 10,
    alignItems: 'center',
  },
  noStepsText: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
    fontWeight: '600',
  },

  // Alternatives Tab Styles
  alternativesContainer: {
    gap: 12,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: NC.onSurface,
    marginBottom: 8,
  },
  routeOption: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  routeOptionSelected: {
    borderColor: NC.primary,
    borderWidth: 2,
  },
  routeOptionRecommended: {
    borderColor: '#4CAF50',
  },
  routeBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  recommendedBadge: {
    backgroundColor: '#E8F5E9',
  },
  recommendedBadgeText: {
    color: '#2E7D32',
  },
  fastestBadge: {
    backgroundColor: '#E3F2FD',
  },
  cheapestBadge: {
    backgroundColor: '#FFF3E0',
  },
  selectedBadge: {
    backgroundColor: NC.primary,
  },
  routeOptionName: {
    fontSize: 16,
    fontWeight: '900',
    color: NC.onSurface,
    marginBottom: 10,
  },
  routeModes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 20,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: NC.onSurface,
  },
  selectionIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'transparent',
  },
  selectionIndicatorActive: {
    backgroundColor: NC.primary,
  },

  // Start Navigation Button
  startNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: NC.primary,
    borderRadius: 24,
    paddingVertical: 18,
    marginTop: 24,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(27,94,32,0.3)',
    shadowColor: 'rgba(27,94,32,0.4)',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },
  startNavText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: NC.onSurfaceVariant,
  },

  // Turn-by-Turn Modal Styles
  tbtOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  tbtSheet: {
    backgroundColor: NC.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  tbtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
  },
  tbtBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
  },
  tbtTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NC.onSurface,
  },
  tbtSubtitle: {
    fontSize: 14,
    color: NC.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
  },
  tbtScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  tbtStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tbtStepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NC.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tbtStepNumText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  tbtStepContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
  },
  tbtManeuver: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tbtStepTextCol: {
    flex: 1,
  },
  tbtStepInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: NC.onSurface,
    lineHeight: 20,
  },
  tbtStepMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  tbtStepDistance: {
    fontSize: 12,
    fontWeight: '800',
    color: NC.primary,
  },
  tbtStepDuration: {
    fontSize: 12,
    color: NC.onSurfaceVariant,
  },
});

export default SegmentedRouteGuide;
