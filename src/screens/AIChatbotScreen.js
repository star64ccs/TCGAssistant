import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import enhancedAIChatService from '../services/enhancedAIChatService';
import AIChatStatusIndicator from '../components/AIChatStatusIndicator';
import EnhancedAIChatIndicator from '../components/EnhancedAIChatIndicator';

const { width } = Dimensions.get('window');

const AIChatbotScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const membership = useSelector(state => state.membership);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chatStats, setChatStats] = useState(null);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const scrollViewRef = useRef();

  // 建議問題
  const suggestionQuestions = enhancedAIChatService.getSuggestionQuestions();

  // 初始化增強 AI 聊天服務
  useEffect(() => {
    initializeEnhancedAIChat();
  }, []);

  useEffect(() => {
    // 添加歡迎消息
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        text: '您好！我是 TCG 助手 AI，可以幫助您解答關於卡牌的問題。我現在具備更智能的分析能力，包括投資建議、真偽檢查和技術分析。',
        type: 'ai',
        timestamp: new Date(),
        intent: 'greeting',
        confidence: 0.95,
      });
    }
  }, []);

  const initializeEnhancedAIChat = async () => {
    try {
      const success = await enhancedAIChatService.initialize();
      if (success) {
        // 獲取聊天統計
        if (user?.id) {
          const stats = enhancedAIChatService.getConversationStats(user.id);
          setChatStats(stats);
        }
      } else {}
    } catch (error) {}
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');
    setShowSuggestions(false);

    // 獲取增強AI回應
    setIsTyping(true);
    try {
      const aiResponse = await generateEnhancedAIResponse(inputText.trim());
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        type: 'ai',
        timestamp: new Date(),
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        model: aiResponse.model,
        responseTime: aiResponse.responseTime,
      };
      addMessage(aiMessage);
      setSelectedIntent(aiResponse.intent);
      setConfidence(aiResponse.confidence);
      // 更新建議
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setShowSuggestions(true);
      }
    } catch (error) {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，服務暫時不可用，請稍後再試。',
        type: 'ai',
        timestamp: new Date(),
        intent: 'error',
        confidence: 0.5,
      };
      addMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const generateEnhancedAIResponse = async (userInput) => {
    try {
      // 使用增強的 AI 聊天服務
      const response = await enhancedAIChatService.getEnhancedChatResponse(
        userInput,
        user?.id || 'anonymous',
        {
          conversationHistory: messages.slice(-10), // 最近10條消息作為上下文
          userType: 'tcg_enthusiast',
          platform: Platform.OS,
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setInputText(suggestion.text);
    setShowSuggestions(false);
  };

  const handleClearChat = () => {
    Alert.alert(
      '確認清除',
      '確定要清除所有對話記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            setShowSuggestions(true);
            setSelectedIntent(null);
            setConfidence(null);
            await enhancedAIChatService.clearHistory();
          },
        },
      ],
    );
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const intentInfo = msg.intent ? ` [${msg.intent}]` : '';
      const confidenceInfo = msg.confidence ? ` (信心度: ${(msg.confidence * 100).toFixed(0)}%)` : '';
      const modelInfo = msg.model ? ` [${msg.model}]` : '';
      return `${msg.type === 'user' ? '用戶' : 'AI'}${intentInfo}${confidenceInfo}${modelInfo}: ${msg.text}`;
    }).join('\n\n');

    Share.open({
      message: chatText,
      title: '導出對話記錄',
    });
  };

  const handleViewStats = () => {
    if (chatStats) {
      Alert.alert(
        '聊天統計',
        `總消息數: ${chatStats.totalMessages}\n專業程度: ${chatStats.expertise}\n興趣領域: ${chatStats.interests.join(', ') || '無'}\n最後活躍: ${new Date(chatStats.lastActive).toLocaleString()}`,
        [{ text: '了解', style: 'default' }],
      );
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage,
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble,
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userText : styles.aiText,
        ]}>
          {item.text}
        </Text>
        {/* AI消息的額外信息 */}
        {item.type === 'ai' && (item.intent || item.confidence || item.model) ? <View style={styles.messageMeta}>
            {item.intent ? <View style={styles.intentTag}>
                <Text style={styles.intentText}>{getIntentDisplayName(item.intent)}</Text>
              </View> : null}
            {item.confidence ? <Text style={styles.confidenceText}>
                信心度: {(item.confidence * 100).toFixed(0)}%
              </Text> : null}
            {item.model && item.model !== 'fallback' ? <Text style={styles.modelText}>{item.model}</Text> : null}
          </View> : null}
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  const getIntentDisplayName = (intent) => {
    const intentNames = {
      general: '一般查詢',
      investment: '投資建議',
      authenticity: '真偽檢查',
      technical: '技術分析',
      greeting: '問候',
      error: '錯誤',
    };
    return intentNames[intent] || intent;
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Icon name={item.icon} size={20} color="#00ffff" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI 助手</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleViewStats}>
            <Icon name="chart-line" size={20} color="#00ffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleClearChat}>
            <Icon name="delete" size={20} color="#00ffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleExportChat}>
            <Icon name="share" size={20} color="#00ffff" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Enhanced AI Status Indicator */}
      <EnhancedAIChatIndicator
        onPress={() => {
          Alert.alert(
            '增強AI 服務狀態',
            '此指示器顯示增強AI聊天服務的詳細狀態，包括多模型支持、智能意圖識別、個性化回應和性能指標。',
            [{ text: '了解', style: 'default' }],
          );
        }}
      />
      {/* Intent and Confidence Display */}
      {selectedIntent && confidence ? <View style={styles.intentDisplay}>
          <View style={styles.intentInfo}>
            <Text style={styles.intentLabel}>當前分析: {getIntentDisplayName(selectedIntent)}</Text>
            <Text style={styles.confidenceLabel}>信心度: {(confidence * 100).toFixed(0)}%</Text>
          </View>
          <View style={[styles.confidenceBar, { width: `${confidence * 100}%` }]} />
        </View> : null}
      {/* Messages */}
      <FlatList
        ref={scrollViewRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      />
      {/* Suggestions */}
      {showSuggestions && messages.length <= 1 ? <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>建議問題</Text>
          <FlatList
            data={suggestionQuestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View> : null}
      {/* Typing Indicator */}
      {isTyping ? <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#00ffff" style={styles.typingSpinner} />
            <Text style={styles.typingText}>AI 正在分析...</Text>
            <View style={styles.typingDots}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        </View> : null}
      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="輸入您的問題..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Icon
            name="send"
            size={20}
            color={inputText.trim() && !isTyping ? '#1A1F71' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  aiBubble: {
    backgroundColor: '#2A2F81',
    borderBottomLeftRadius: 5,
    borderColor: '#00ffff',
    borderWidth: 1,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  aiText: {
    color: '#fff',
  },
  confidenceBar: {
    backgroundColor: '#00ffff',
    borderRadius: 2,
    height: 4,
  },
  confidenceLabel: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#ccc',
    fontSize: 12,
    marginRight: 8,
  },
  container: {
    backgroundColor: '#1A1F71',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerButton: {
    alignItems: 'center',
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    width: 40,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  intentDisplay: {
    backgroundColor: 'rgba(42, 47, 129, 0.8)',
    borderColor: '#00ffff',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 12,
  },
  intentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intentLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  intentTag: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 12,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  intentText: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 20,
    maxWidth: '80%',
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  messageMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modelText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#00ffff',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2F81',
    borderColor: '#666',
    borderWidth: 1,
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionItem: {
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  suggestionsContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  suggestionsList: {
    paddingRight: 20,
  },
  suggestionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#2A2F81',
    borderColor: '#00ffff',
    borderRadius: 25,
    borderWidth: 1,
    color: '#fff',
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  timestamp: {
    alignSelf: 'flex-end',
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  typingBubble: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2A2F81',
    borderBottomLeftRadius: 5,
    borderColor: '#00ffff',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 15,
  },
  typingContainer: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  typingDot: {
    backgroundColor: '#00ffff',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 2,
    width: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingSpinner: {
    marginRight: 8,
  },
  typingText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  userBubble: {
    backgroundColor: '#00ffff',
    borderBottomRightRadius: 5,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  userText: {
    color: '#1A1F71',
  },
});

export default AIChatbotScreen;
