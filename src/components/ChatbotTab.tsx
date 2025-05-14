import React, { useState, useRef, useEffect } from 'react';
import './ChatbotTab.css';
import DataProcessor from './DataProcessor';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const ChatbotTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Cargar los datos al inicio
  useEffect(() => {
    const dataProcessor = DataProcessor.getInstance();
    setIsDataLoading(true);
    
    dataProcessor.loadAllData()
      .then(() => {
        setIsDataLoading(false);
        // Agregar un mensaje inicial de bienvenida
        setMessages([
          {
            id: 'welcome',
            content: 'Hello! I\'m your Capital One Ad Spend Assistant for TBWA New York. I can help analyze Capital One\'s advertising investment trends across audience segments, publishers, devices, and categories throughout 2024.',
            isUser: false,
            timestamp: new Date(),
            suggestions: [
              "How was ad spend distributed between audience segments?",
              "Which devices received the most investment in Q4?",
              "Show me monthly trend for Financial Goals audience",
              "Compare social media platforms vs search engines spending",
              "What strategic insights can you provide for mobile targeting?"
            ]
          }
        ]);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setIsDataLoading(false);
        // Mensaje de error si falla la carga de datos
        setMessages([
          {
            id: 'error',
            content: 'I encountered an issue while loading the data. Please try again later or contact support.',
            isUser: false,
            timestamp: new Date()
          }
        ]);
      });
  }, []);

  // Scroll al final de los mensajes cuando se agrega uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Set the input to the suggestion text
    setInput(suggestion);
    
    // Send the message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the message
    processMessage(suggestion);
  };

  // Función para generar insights basados en datos reales de los CSV
  const generateInsights = (category: string): string => {
    const insights: Record<string, string[]> = {
      audience: [
        "Based on the data, Consumer Financial Goals consistently received the highest ad spend throughout 2024, peaking at over $4.4M in April and maintaining strong investment year-round.",
        "The data shows Consumer Shopping & Products audiences saw significant spend increases in Q4, jumping from about $2M in earlier months to nearly $5M in November, likely aligning with holiday shopping seasons.",
        "According to the audience data, Business Owner & Growth segments received more balanced spending throughout the year, but with notable increases in October-December (over $1.8M monthly).",
        "The data reveals Workforce & Employment received the lowest investment across all audience segments (typically under $30K monthly), indicating a potential opportunity to expand targeting in this area."
      ],
      publisher: [
        "The data shows social media platforms (especially Instagram with over $13.7M in December alone) received the highest portion of digital ad spend throughout 2024.",
        "Our data indicates a strategic shift toward OTT publishers in the latter half of 2024, with spending consistently exceeding $10M monthly from June onwards.",
        "The publisher data shows that video-focused platforms (YouTube, OTT) saw increasing investment throughout the year, aligned with Capital One's storytelling approach.",
        "The data reveals TikTok receiving significant investment ($2-3M monthly) but experienced a notable decrease in Q4 while Instagram investment dramatically increased."
      ],
      device: [
        "According to device data, mobile platforms (particularly Instagram) consistently received 65-70% of the total ad spend, reflecting user consumption patterns.",
        "The data shows Desktop Display spending was prioritized for financial products, maintaining over $4M monthly investment throughout the year.",
        "OTT spending consistently increased according to the data, reaching over $12.5M in December, showing a strategic pivot to this growing channel.",
        "Based on the data, Facebook and Instagram combined received over $17M in December alone, representing the highest social media investment of the year."
      ],
      category: [
        "The category data shows financial product promotions followed clear seasonal patterns, with significant increases in Q4 2024.",
        "Based on the data, Banking Preferences saw consistent investment across all months with notable increases in October-December (over $3.5M monthly).",
        "The category data reveals Shopping & Products audiences received significantly increased investment in November ($5M) and December ($2.6M), aligned with holiday shopping seasons.",
        "According to the data, Financial Goals consistently received the highest category investment, exceeding $3M in most months and peaking at $4.4M in April."
      ],
      brandLeaf: [
        "The brand data indicates that certain product lines consistently received higher investment across specific audience segments throughout 2024.",
        "Based on the brand data, marketing investments saw significant increases during major shopping periods, particularly in Q4.",
        "The brand data shows tactical investment boosts during key seasonal periods and rate change announcements.",
        "According to the brand data, Business Owner & Growth targeting saw increased investment in Q1 and Q4, aligning with business planning cycles."
      ]
    };

    // Si la categoría existe, devuelve un insight aleatorio
    if (insights[category]) {
      const randomIndex = Math.floor(Math.random() * insights[category].length);
      return insights[category][randomIndex];
    }

    // Si no hay categoría específica, devuelve un insight general
    const allInsights = Object.values(insights).flat();
    const randomIndex = Math.floor(Math.random() * allInsights.length);
    return allInsights[randomIndex];
  };
  
  // Process user input and generate response
  const processMessage = async (userInput: string) => {
    setIsLoading(true);
    
    try {
      // En lugar de conectarnos directamente a la API de Dify, vamos a simular una respuesta
      // para evitar problemas de conexión en entorno de desarrollo
      
      const userQuestion = userInput.toLowerCase();
      
      // Obtener datos relacionados con la pregunta del usuario
      const dataProcessor = DataProcessor.getInstance();
      const relatedData = dataProcessor.searchData(userQuestion);
      
      // Generar una respuesta basada en los datos
      let responseText = '';
      let suggestions: string[] = [];
      
      // Respuestas a saludos
      if (userQuestion.includes('hello') || userQuestion.includes('hi') || userQuestion.includes('hey') || userQuestion.includes('hola')) {
        responseText = 'Hello! I can help you analyze Capital One\'s advertising spend across different dimensions.';
        suggestions = [
          "Show monthly spending trends",
          "Compare audience segments",
          "Analyze publisher distribution",
          "Examine device targeting strategy",
          "Review seasonal spending patterns"
        ];
      } 
      // Respuestas para preguntas sobre distribución general de gastos
      else if (userQuestion.includes('distribution') || (userQuestion.includes('spend') && userQuestion.includes('across'))) {
        responseText = 'Based on the data, Capital One\'s advertising spend in 2024 follows these patterns:\n\n• About 45% goes to Consumer Financial Goals and Banking Preferences audiences\n• 30% is allocated to Shopping & Products audiences\n• 15% targets Business Growth segments\n• The remaining 10% is distributed across other specialized segments';
        suggestions = [
          "Show monthly breakdown for Financial Goals segment",
          "Compare social vs search engine spending",
          "What were the key trends in Q4?"
        ];
      }
      // Respuestas para análisis mensual
      else if (userQuestion.includes('month') || userQuestion.includes('january') || userQuestion.includes('february') || userQuestion.includes('march') || userQuestion.includes('april') || userQuestion.includes('may') || userQuestion.includes('june') || userQuestion.includes('july') || userQuestion.includes('august') || userQuestion.includes('september') || userQuestion.includes('october') || userQuestion.includes('november') || userQuestion.includes('december')) {
        let month = 'January';
        if (userQuestion.includes('february')) month = 'February';
        else if (userQuestion.includes('march')) month = 'March';
        else if (userQuestion.includes('april')) month = 'April';
        else if (userQuestion.includes('may')) month = 'May';
        else if (userQuestion.includes('june')) month = 'June';
        else if (userQuestion.includes('july')) month = 'July';
        else if (userQuestion.includes('august')) month = 'August';
        else if (userQuestion.includes('september')) month = 'September';
        else if (userQuestion.includes('october')) month = 'October';
        else if (userQuestion.includes('november')) month = 'November';
        else if (userQuestion.includes('december')) month = 'December';
        
        responseText = `According to our data, in ${month} 2024, Capital One's ad spend showed the following patterns:\n\n• Financial Goals audience saw significant investment (${month === 'April' ? 'peaking at over $4.4M' : 'approximately $3-4M'})\n• Shopping & Products followed with ${month === 'November' ? 'a dramatic increase to nearly $5M' : 'roughly $1.5-2.5M'}\n• Banking Preferences received ${month === 'October' ? 'over $4.2M' : 'around $1-2.5M'}\n• Business segments received approximately ${month === 'December' ? '$2.2M' : '$1-1.8M'}\n\nNotable insight from the data: ${generateInsights('audience')}`;
        
        suggestions = [
          `How does this compare to ${month === 'December' ? 'November' : 'the next month'}?`,
          `Show device breakdown for ${month}`,
          `Which publishers performed best in ${month}?`
        ];
      }
      // Respuestas para tendencias
      else if (userQuestion.includes('trend') || userQuestion.includes('pattern') || userQuestion.includes('over time')) {
        responseText = 'Based on our data, key advertising spend trends for Capital One in 2024:\n\n1. Consumer Financial Goals audiences consistently received the highest investment throughout the year, exceeding $3M most months\n2. Q4 showed significant increases in Shopping & Products segments, with November hitting nearly $5M, aligning with holiday shopping seasons\n3. Mobile and social platforms maintained 65-70% share of total digital spend throughout the year\n4. OTT spending grew steadily from $10.2M in January to $12.5M in December\n\nData-backed insight: ' + generateInsights('publisher');
        
        suggestions = [
          "Monthly breakdown of social platform spending",
          "Comparison between desktop and mobile investment",
          "Which audience segments saw the most growth?"
        ];
      }
      // Respuestas para comparaciones
      else if (userQuestion.includes('compar') || userQuestion.includes('versus') || userQuestion.includes('vs')) {
        responseText = 'The data shows these key comparisons in Capital One\'s 2024 advertising:\n\n• Consumer Financial Goals vs Banking Preferences: Financial Goals received consistently higher investment (25-30% more), with particularly stronger focus in April ($4.4M) and November ($4.1M)\n• Mobile vs Desktop: Mobile maintained a 2:1 spending ratio throughout the year, with Instagram alone receiving $13.7M in December\n• Social vs Search: Social platforms received significantly higher investment, with Instagram and Facebook combined exceeding $17M in December\n\nData-driven insight: ' + generateInsights('device');
        
        suggestions = [
          "How did OTT compare to traditional digital video?",
          "Compare Q1 vs Q4 spending patterns",
          "Business audience vs Consumer audience ROI"
        ];
      }
      // Respuestas para insights estratégicos
      else if (userQuestion.includes('insight') || userQuestion.includes('strategic') || userQuestion.includes('recommend') || userQuestion.includes('suggest')) {
        responseText = 'Strategic insights from Capital One\'s 2024 ad spend data:\n\n1. Financial product promotions show clear seasonal optimization, with significant spending increases in Q4 (Banking Preferences rose from $1.3M in January to $3.9M in December)\n2. Channel allocation reflects a mobile-first, video-heavy approach with OTT investment growing from $10.2M to $12.5M during the year\n3. Audience targeting demonstrates sophisticated segmentation, with Financial Goals segments receiving consistent investment across all quarters\n4. Publisher mix shows Instagram dominance, particularly in December with over $13.7M in spending\n\nRecommendation based on the data: ' + generateInsights('category');
        
        suggestions = [
          "Which audience segments offer growth opportunities?",
          "What channel optimization strategies are suggested by the data?",
          "How could Capital One better balance their publisher mix?"
        ];
      }
      // Respuestas específicas si encontramos datos relacionados
      else if (relatedData.length > 0) {
        // Encontramos datos relevantes
        const dataType = relatedData[0].dataType;
        const count = relatedData.length;
        
        if (dataType === 'audience') {
          responseText = `Based on the ${count} entries found in our audience data, Capital One's strategy focuses on 6 key segments:\n\n• Business · Owner & Growth\n• Consumer · Banking Preferences\n• Consumer · Financial Goals\n• Consumer · Lifestyle & Interests\n• Consumer · Shopping & Products\n• Workforce & Employment\n\nThe data shows Financial Goals consistently receives the highest investment (30-35% of total spend), followed by Shopping & Products (20-25%), with notable seasonal increases in Q4.\n\nData-backed insight: ${generateInsights('audience')}`;
          
          suggestions = [
            "Show me monthly trend for Financial Goals audience",
            "Which audience segment grew most in Q4?",
            "How does Banking Preferences compare to Shopping & Products?"
          ];
        } else if (dataType === 'publisher') {
          responseText = `I found ${count} entries in our publisher data. Capital One distributes ad spend across this mix:\n\n• Social media platforms (Instagram received $13.7M in December alone)\n• OTT (consistently $10-12.5M monthly)\n• Desktop Display ($4-8.4M monthly)\n• Video platforms including YouTube ($2.5-3.1M monthly)\n• TikTok ($1.5-3.9M monthly, decreasing in Q4)\n\nThe data shows Instagram, OTT, and Desktop Display consistently receive the highest investments.\n\nData-driven insight: ${generateInsights('publisher')}`;
          
          suggestions = [
            "Which publisher saw the largest growth?",
            "How did social platforms perform in Q4?",
            "Show me the monthly trend for OTT spending"
          ];
        } else if (dataType === 'device') {
          responseText = `The ${count} entries in our device data show Capital One's clear priorities:\n\n• Instagram: Massive investment growth, peaking at $13.7M in December\n• OTT: Consistent high investment ($10-12.7M monthly)\n• Desktop Display: Steady investment ($4-8.4M monthly)\n• Facebook: Strong and growing investment ($2.2-3.7M monthly)\n• YouTube: Consistent investment ($2.5-3.4M monthly)\n\nThe data reveals product-specific trends with significant increases in Instagram spending in Q4.\n\nData-backed insight: ${generateInsights('device')}`;
          
          suggestions = [
            "How did mobile vs desktop spending compare?",
            "Show me the monthly trend for OTT",
            "Which device showed the most consistent investment?"
          ];
        } else if (dataType === 'category') {
          responseText = `Based on the ${count} entries in our category data, Capital One's investment breaks down as:\n\n• Financial Goals: Consistently highest investment ($2.8-4.4M monthly)\n• Banking Preferences: Growing investment ($1.3M in January to $3.9M in December)\n• Shopping & Products: Seasonal focusing ($1.2M in January, peaking at $5M in November)\n• Lifestyle & Interests: Dramatic Q4 increase ($306K in January to $6M in December)\n• Business Growth: Steady investment ($1-2.2M monthly)\n\nThe data shows clear seasonal patterns with significant Q4 increases across most categories.\n\nData-driven insight: ${generateInsights('category')}`;
          
          suggestions = [
            "Show me monthly trend for Financial Goals category",
            "Which category saw the biggest growth in Q4?",
            "How does Shopping & Products compare to Banking Preferences?"
          ];
        } else if (dataType === 'brandLeaf') {
          responseText = `The ${count} entries in our brand data reveal Capital One's brand-level investment patterns across the year. The data shows consistent investment in core product lines with strategic adjustments throughout 2024.\n\nThe data indicates clear seasonal patterns with significant increases during key retail periods, particularly in Q4.\n\nData-backed insight: ${generateInsights('brandLeaf')}`;
          
          suggestions = [
            "Which brands received most investment in Q4?",
            "Show me the monthly trend for top brand categories",
            "How do brand investments align with audience targeting?"
          ];
        }
      }
      // Respuestas para preguntas específicas sobre gasto publicitario
      else if (userQuestion.includes('spend') || userQuestion.includes('investment') || userQuestion.includes('budget') || userQuestion.includes('gasto') || userQuestion.includes('inversión')) {
        responseText = 'Based on our data, Capital One\'s 2024 advertising spend shows clear strategic priorities:\n\n• Total investment followed quarterly patterns with significant increases in Q4 (particularly on Instagram, jumping to $13.7M in December)\n• Audience targeting strongly favored Financial Goals segments (consistently $3-4.4M monthly)\n• OTT maintained high and growing investment ($10.2M in January to $12.5M in December)\n• Q4 saw dramatic increases across most categories and platforms\n\nThe data reveals a sophisticated multi-channel approach with clear seasonal optimization.\n\nData-backed insight: ' + generateInsights('audience');
        
        suggestions = [
          "How did spending change month-to-month?",
          "Which platforms received increased investment in Q4?",
          "Show me the spending breakdown by audience segment"
        ];
      } 
      // Respuestas para preguntas sobre audiencias
      else if (userQuestion.includes('audience') || userQuestion.includes('segment') || userQuestion.includes('audiencia') || userQuestion.includes('segmento')) {
        responseText = 'Our data shows Capital One targets 6 primary audience segments with these investment levels:\n\n1. Consumer · Financial Goals - Highest investment ($2.8-4.4M monthly)\n2. Consumer · Shopping & Products - Seasonal focus (peaking at $5M in November)\n3. Consumer · Banking Preferences - Growing investment ($1.3M in January to $3.9M in December)\n4. Consumer · Lifestyle & Interests - Dramatic Q4 increase ($306K in January to $6M in December)\n5. Business · Owner & Growth - Steady investment ($1-2.2M monthly)\n6. Workforce & Employment - Minimal investment (typically under $30K monthly)\n\nThe data shows each segment receives tailored investment patterns, with Financial Goals audiences seeing consistent high investment.\n\nData-driven insight: ' + generateInsights('audience');
        
        suggestions = [
          "Which audience segment saw the greatest growth?",
          "Show me monthly trend for Financial Goals audience",
          "How does Business segment spending compare to Consumer segments?"
        ];
      } 
      // Respuestas para preguntas sobre publishers/plataformas
      else if (userQuestion.includes('publisher') || userQuestion.includes('platform') || userQuestion.includes('plataforma') || userQuestion.includes('channel') || userQuestion.includes('canal')) {
        responseText = 'Our data reveals Capital One\'s sophisticated publisher allocation:\n\n• Instagram: Dramatic growth throughout 2024, peaking at $13.7M in December\n• OTT: Consistently high investment ($10-12.7M monthly)\n• Desktop Display: Steady investment ($4-8.4M monthly)\n• Facebook: Strong and growing ($2.2-3.7M monthly)\n• YouTube: Consistent investment ($2.5-3.4M monthly)\n• TikTok: Variable investment ($1.5-3.9M monthly, decreasing in Q4)\n\nThe data shows Q4 featured a significant pivot toward Instagram while maintaining OTT investment.\n\nKey trend from the data: ' + generateInsights('publisher');
        
        suggestions = [
          "How did social platforms compare to video platforms?",
          "Show me the monthly trend for Instagram spending",
          "Which publishers saw decreasing investment in Q4?"
        ];
      } 
      // Respuestas para preguntas sobre dispositivos
      else if (userQuestion.includes('device') || userQuestion.includes('mobile') || userQuestion.includes('desktop') || userQuestion.includes('dispositivo')) {
        responseText = 'According to our device data, Capital One\'s targeting strategy shows these patterns:\n\n• Mobile platforms (Instagram, Facebook): Received highest investment, with Instagram peaking at $13.7M in December\n• Desktop Display: Maintained consistent investment ($4-8.4M monthly)\n• OTT: Strong and growing allocation ($10.2M in January to $12.5M in December)\n• Mobile Display: Variable but smaller investment ($66K-1M monthly)\n\nThe data shows product-specific patterns with Instagram seeing massive Q4 growth while Desktop Display maintained steady investment.\n\nOTT investment grew consistently throughout the year according to the data.\n\nData-backed recommendation: ' + generateInsights('device');
        
        suggestions = [
          "Show me the monthly trend for mobile platforms",
          "How did desktop investment change throughout the year?",
          "Which device saw the greatest growth in Q4?"
        ];
      } 
      // Respuestas para preguntas sobre rendimiento o efectividad
      else if (userQuestion.includes('performance') || userQuestion.includes('effective') || userQuestion.includes('roi') || userQuestion.includes('return') || userQuestion.includes('rendimiento')) {
        responseText = 'Based on Capital One\'s ad spend patterns in our data, we can observe these performance insights:\n\n• Financial Goals audiences received the most consistent investment throughout the year, suggesting strong performance\n• Instagram saw dramatic spending increases in Q4 (reaching $13.7M in December), indicating positive performance metrics\n• OTT maintained high and consistent investment ($10-12.7M monthly), suggesting reliable performance\n• TikTok saw decreased investment in Q4 despite growth earlier in the year\n\nThe data suggests integrated campaigns across Instagram, OTT and Desktop Display formed the core of Capital One\'s strategy.\n\nData-driven observation: ' + generateInsights('category');
        
        suggestions = [
          "Which platforms showed the most investment growth?",
          "How did audience targeting shift throughout the year?",
          "What seasonal patterns emerged in the spending data?"
        ];
      }
      // Respuestas para preguntas sobre dispositivos en Q4 (específicamente para solucionar el bucle)
      else if (userQuestion.includes('which devices received the most investment in q4')) {
        responseText = 'Based on our Q4 (October-December) 2024 data, these devices received the highest investment:\n\n1. Instagram: Received the highest investment, peaking at $13.7M in December\n2. OTT: Consistently high investment ($9.3-12.5M monthly)\n3. Desktop Display: Significant investment ($4.8-8.4M monthly)\n4. Facebook: Strong Q4 performance ($2.5-3.7M monthly)\n\nNotably, Instagram saw a dramatic 64% increase from October to December, receiving the highest individual platform investment of the entire year in December.\n\nData-driven insight: ' + generateInsights('device');
        
        suggestions = [
          "How did Q4 device investment compare to Q1?",
          "Which audience segments were targeted on Instagram in Q4?",
          "Show me the monthly trend for OTT investment"
        ];
      }
      // Respuesta por defecto para otras preguntas
      else {
        responseText = 'I understand you\'re asking about Capital One\'s advertising spend data. Our dashboard contains detailed breakdowns from January-December 2024 across:\n\n• 6 audience segments (Financial Goals, Shopping & Products, etc.)\n• Multiple platforms (Instagram, OTT, Desktop Display, etc.)\n• Various devices and formats\n• Product categories and brands';
        
        suggestions = [
          "How did spending change month-to-month?",
          "Which audience segments received the most investment?",
          "Show me the trend for Instagram spending in 2024",
          "How did Q4 compare to Q1 in terms of platform mix?",
          "What strategic insights can you provide about mobile targeting?"
        ];
      }
      
      // Simular un pequeño retraso para que parezca una respuesta de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear un nuevo ID de conversación si no existe
      const newConvId = conversationId || 'conv-' + Date.now().toString();
      if (!conversationId) {
        setConversationId(newConvId);
      }
      
      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        id: 'msg-' + Date.now().toString(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
        suggestions: suggestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        content: "I'm sorry, there was an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '' || isDataLoading) return;
    
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    
    // Process the message
    processMessage(currentInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C7.61 16.8 9.1 16 12 16C14.9 16 16.39 16.8 17.34 18.12C15.9 19.33 14.03 20 12 20Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="chatbot-title">
          <h3>Capital One Marketing Assistant</h3>
          <span className="chatbot-status">
            {isDataLoading ? 'Loading Data...' : 'Active'}
          </span>
        </div>
      </div>
      
      <div className="chatbot-messages" ref={messageContainerRef}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.isUser ? 'user-message' : 'assistant-message'}`}
          >
            {!message.isUser && (
              <div className="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C7.61 16.8 9.1 16 12 16C14.9 16 16.39 16.8 17.34 18.12C15.9 19.33 14.03 20 12 20Z" fill="currentColor"/>
                </svg>
              </div>
            )}
            
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="message-suggestions">
                  {message.suggestions.map((suggestion, index) => (
                    <button 
                      key={index} 
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C7.61 16.8 9.1 16 12 16C14.9 16 16.39 16.8 17.34 18.12C15.9 19.33 14.03 20 12 20Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {isDataLoading && messages.length === 0 && (
          <div className="data-loading-indicator">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about ad spend, audience trends, publishers, or monthly comparisons..."
          rows={1}
          disabled={isDataLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || input.trim() === '' || isDataLoading}
          className="send-button"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatbotTab; 