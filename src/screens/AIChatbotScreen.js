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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

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
  const scrollViewRef = useRef();

  // 建議問題
  const suggestionQuestions = [
    {
      id: '1',
      text: '這張卡牌的詳細信息是什麼？',
      icon: 'information'
    },
    {
      id: '2',
      text: '這張卡牌的當前價格如何？',
      icon: 'currency-usd'
    },
    {
      id: '3',
      text: '這張卡牌值得投資嗎？',
      icon: 'trending-up'
    },
    {
      id: '4',
      text: '如何評估卡牌的品相？',
      icon: 'eye'
    },
    {
      id: '5',
      text: '市場趨勢如何？',
      icon: 'chart-line'
    }
  ];

  // TODO: 實現真實的AI回答
  const mockAIResponses = {
    'card_info': 'AI功能需要真實API支援，請聯繫開發團隊。',
    'price': 'AI功能需要真實API支援，請聯繫開發團隊。',
    'investment': 'AI功能需要真實API支援，請聯繫開發團隊。',
    'condition': 'AI功能需要真實API支援，請聯繫開發團隊。',
    'market_trend': 'AI功能需要真實API支援，請聯繫開發團隊。'
  };

  useEffect(() => {
    // 添加歡迎消息
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        text: '您好！我是 TCG 助手 AI，可以幫助您解答關於卡牌的問題。',
        type: 'ai',
        timestamp: new Date()
      });
    }
  }, []);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      type: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInputText('');
    setShowSuggestions(false);

    // 獲取AI回應
    setIsTyping(true);
    try {
      const aiResponseText = await generateAIResponse(inputText.trim());
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        type: 'ai',
        timestamp: new Date()
      };
      addMessage(aiResponse);
    } catch (error) {
      console.error('發送消息失敗:', error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: '抱歉，服務暫時不可用，請稍後再試。',
        type: 'ai',
        timestamp: new Date()
      };
      addMessage(errorResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    try {
      // 調用API整合管理器獲取AI回應
      const apiIntegrationManager = require('../services/apiIntegrationManager').default;
      const result = await apiIntegrationManager.callApi(
        'aiAnalysis',
        'analyze',
        { 
          prompt: userInput,
          context: {
            conversationHistory: messages.slice(-10), // 最近10條消息作為上下文
            userType: 'tcg_enthusiast'
          }
        },
        { useCache: false }
      );
      
      if (result && result.data && result.data.response) {
        return result.data.response;
      } else {
        return '抱歉，我暫時無法回應您的問題，請稍後再試。';
      }
    } catch (error) {
      console.error('AI回應生成失敗:', error);
      return '抱歉，服務暫時不可用，請稍後再試。';
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
          onPress: () => {
            setMessages([]);
            setShowSuggestions(true);
          },
        },
      ]
    );
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.type === 'user' ? '用戶' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    Share.open({
      message: chatText,
      title: '導出對話記錄'
    });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

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
          <TouchableOpacity style={styles.headerButton} onPress={handleClearChat}>
            <Icon name="delete" size={20} color="#00ffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleExportChat}>
            <Icon name="share" size={20} color="#00ffff" />
          </TouchableOpacity>
        </View>
      </View>

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
      {showSuggestions && messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>建議問題</Text>
          <FlatList
            data={suggestionQuestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <Text style={styles.typingText}>AI 正在輸入...</Text>
            <View style={styles.typingDots}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        </View>
      )}

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
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={20} color={inputText.trim() ? '#1A1F71' : '#666'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#00ffff',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: '#2A2F81',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#1A1F71',
  },
  aiText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  suggestionsList: {
    paddingRight: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  typingContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  typingBubble: {
    backgroundColor: '#2A2F81',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ffff',
    borderBottomLeftRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  typingText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ffff',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2A2F81',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#00ffff',
    marginRight: 10,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2F81',
    borderWidth: 1,
    borderColor: '#666',
  },
});

export default AIChatbotScreen;
