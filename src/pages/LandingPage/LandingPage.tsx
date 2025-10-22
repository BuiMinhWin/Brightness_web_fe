import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import AppHeader from "../../components/layout/AppHeader";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import PoolIcon from '@mui/icons-material/Pool';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsContainerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const foxRef = useRef<HTMLImageElement>(null);
  const emojiGroupRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLElement>(null);
  const panel2TextRef = useRef<HTMLDivElement>(null);
  const panel2CarouselRef = useRef<HTMLDivElement>(null);
  const panel3Ref = useRef<HTMLElement>(null);
  const panel3FeedRef = useRef<HTMLDivElement>(null);
  const panel4Ref = useRef<HTMLElement>(null);
  const panel5Ref = useRef<HTMLElement>(null);
  const panel6Ref = useRef<HTMLElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Chat typing animation state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user', text: string, isTyping?: boolean, isCTA?: boolean }>>([]);
  const chatAnimationTriggered = useRef(false);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const [shakeCTA, setShakeCTA] = useState(false);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle shake animation for CTA
  const handleShakeCTA = () => {
    console.log('Shake triggered!');
    setShakeCTA(true);
    setTimeout(() => {
      setShakeCTA(false);
      console.log('Shake reset');
    }, 500); // Reset after animation
  };

  // Chat typing animation function
  const startChatTypingAnimation = () => {
    const conversation = [
      { sender: 'bot' as const, text: 'Hi there! How can I help you today?' },
      { sender: 'user' as const, text: 'I want to start working out but I don\'t know where to begin' },
      { sender: 'bot' as const, text: 'Great! I can help you with that. What are your fitness goals?' },
      { sender: 'user' as const, text: 'I want to lose weight and build some muscle' },
      { sender: 'bot' as const, text: 'Perfect! I can create a personalized workout plan for you' },
      { sender: 'bot' as const, text: 'Ready to start your journey? Sign up now!', isCTA: true }
    ];

    let messageIndex = 0;
    
    const typeNextMessage = () => {
      if (messageIndex >= conversation.length) return;
      
      const currentMessage = conversation[messageIndex];
      const words = currentMessage.text.split(' ');
      let wordIndex = 0;
      
      // Show typing indicator
      setChatMessages(prev => [...prev, { ...currentMessage, text: '', isTyping: true }]);
      
      const typeInterval = setInterval(() => {
        if (wordIndex < words.length) {
          const currentText = words.slice(0, wordIndex + 1).join(' ');
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...currentMessage, text: currentText, isTyping: false };
            return updated;
          });
          wordIndex++;
        } else {
          clearInterval(typeInterval);
          messageIndex++;
          // Wait before next message
          setTimeout(typeNextMessage, messageIndex === conversation.length ? 0 : 800);
        }
      }, 100); // Type each word every 100ms
    };
    
    typeNextMessage();
  };

  useEffect(() => {
    // Wait for DOM to be ready
    const initAnimations = () => {
      const panels = gsap.utils.toArray<HTMLElement>(".panel");
      
      // Hero title word-by-word drop animation
      if (heroTitleRef.current) {
        const words = heroTitleRef.current.querySelectorAll(".word");
        
        if (words.length > 0) {
          // Animate from initial state
          gsap.fromTo(words, 
            {
              y: -100,
              opacity: 0,
              rotation: "random(-80, 80)",
            },
            {
              y: 0,
              opacity: 1,
              rotation: 0,
              stagger: 0.1,
              duration: 1,
              ease: "back.out(1.7)",
              delay: 0.2,
            }
          );
        }
      }

      // Emoji animations
      if (emojiGroupRef.current) {
        gsap.fromTo(emojiGroupRef.current,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.5,
            delay: 0.6,
          }
        );
        
        const emojiElements = emojiGroupRef.current.querySelectorAll('.draggable-emoji');
        if (emojiElements.length > 0) {
          gsap.fromTo(emojiElements,
            {
              scale: 0.8,
              y: 20,
            },
            {
              scale: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power2.out",
              delay: 1.6, // Changed from 0.7 to 1.6 (after tagline)
            }
          );
        }
      }

      // CTA Buttons animation
      if (ctaButtonsRef.current) {
        const buttons = ctaButtonsRef.current.querySelectorAll('button');
        gsap.fromTo(buttons,
          { opacity: 0, y: 20, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.6, 
            stagger: 0.15,
            ease: "back.out(1.5)", 
            delay: 2.4 // Changed from 1.4 to 2.4 (after sport icons)
          }
        );
      }

      // Floating orbs animation
      const orbs = document.querySelectorAll('.floating-orb');
      orbs.forEach((orb, index) => {
        gsap.to(orb, {
          y: "random(-30, 30)",
          x: "random(-20, 20)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });
      });

      // Draggable Sports Icons
      const draggableEmojis = document.querySelectorAll('.draggable-emoji');

      draggableEmojis.forEach((emoji) => {
        Draggable.create(emoji, {
          type: 'x,y',
          onPress: function() {
            gsap.to(emoji, { duration: 0.1, scale: 1.3, rotate: 'random(-9, 9)', zIndex: 100 });
            gsap.to(draggableEmojis, { 
              duration: 0.1, 
              opacity: (i, t) => (t === emoji) ? 1 : 0.3 
            });
          },
          onRelease: function() {
            gsap.to(emoji, { 
              duration: 0.4, 
              x: 0, 
              y: 0, 
              rotate: 0, 
              scale: 1, 
              zIndex: 0,
              ease: 'elastic.out(0.45)' 
            });
            gsap.to(draggableEmojis, { duration: 0.2, opacity: 1 });
          }
        });
      });
      
      // Tagline animation with SplitText-like effect
      if (taglineRef.current) {
        const element = taglineRef.current;
        const text = element.textContent || '';
        
        // Set parent element opacity to 1 before animation
        gsap.set(element, { opacity: 1 });
        
        // Split text into characters
        const chars = text.split('').map((char) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          span.style.position = 'relative';
          span.style.willChange = 'transform';
          span.className = 'char-split';
          return span;
        });
        
        // Replace text with character spans
        element.innerHTML = '';
        chars.forEach(char => element.appendChild(char));
        
        // Animate chars in with GSAP
        gsap.from(chars, {
          duration: 1.2,
          opacity: 0,
          scale: 0,
          y: 80,
          rotationX: 180,
          transformOrigin: "0% 50% -50",
          ease: "back.out(1.7)",
          stagger: 0.02,
          delay: 0.7, // Changed from 1.2 to 0.7 (right after title)
          onComplete: () => {
            // Revert split text back to normal text for performance & a11y
            element.innerHTML = '';
            element.textContent = text;
          }
        });
      }

    // Floating animations for decorative elements
    if (foxRef.current) {
      gsap.to(foxRef.current, {
        y: -15,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }


      // Calculate Panel 2 and Panel 3 extra scroll based on ACTUAL content
      let totalCardsWidth = 0;
      let panel2ScrollDistance = 0;
      let panel2ExtraScroll = window.innerHeight * 3.5; // Default
      
      if (panel2Ref.current && panel2TextRef.current && panel2CarouselRef.current) {
        const cards = panel2CarouselRef.current.querySelectorAll('.card-item');
        totalCardsWidth = cards.length * 400 + (cards.length - 1) * 32;
        
        // Calculate EXACT scroll distance needed
        panel2ScrollDistance = totalCardsWidth - window.innerWidth + 160;
        
        // Set pin duration to be comfortable for this scroll distance
        // Formula: pin duration should be proportional to scroll distance
        // Use viewport width as base unit - 1 viewport width = 1 viewport height of scroll
        panel2ExtraScroll = (panel2ScrollDistance / window.innerWidth) * window.innerHeight;
        
        console.log('Panel2 pre-calculation:', {
          totalCardsWidth,
          viewportWidth: window.innerWidth,
          panel2ScrollDistance,
          panel2ExtraScroll,
          ratio: panel2ScrollDistance / window.innerWidth
        });
      }
      
      // Calculate Panel 3 extra scroll - aggressive reduction to eliminate gap
      let panel3ScrollDistance = 0;
      let panel3ExtraScroll = window.innerHeight * 2.5; // Default
      
      if (panel3FeedRef.current) {
        const feed = panel3FeedRef.current;
        const feedHeight = feed.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        // Calculate full scroll distance
        const fullScrollDistance = Math.max(feedHeight - viewportHeight, 0);
        
        // NO reduction - scroll FULL distance to see ALL posts!
        // Buffer needed to see last post fully
        const buffer = 200; // Buffer for last post visibility
        panel3ScrollDistance = fullScrollDistance + buffer;
        panel3ExtraScroll = panel3ScrollDistance;
        
        console.log('Panel3 pre-calculation FULL SCROLL:', {
          feedHeight,
          viewportHeight,
          fullScrollDistance,
          buffer,
          panel3ScrollDistance,
          panel3ExtraScroll,
          reduction: '0 (NONE!)',
          explanation: 'Scroll FULL distance + buffer to see last post completely'
        });
      }

      // Calculate Panel 4 (Gamification) extra scroll for animation timing
      // Pin the panel while cards scale in, stay visible, then scale out
      const panel4ExtraScroll = window.innerHeight * 2; // 2 viewport heights for animations
      
      console.log('Panel4 pre-calculation:', {
        panel4ExtraScroll,
        explanation: 'Pin panel for card scale animations'
      });

      // Create custom horizontal scroll timeline with Panel 2, 3 & 4 special handling
      const horizontalScrollTL = gsap.timeline({
        scrollTrigger: {
          trigger: panelsContainerRef.current,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: (progress) => {
              // Calculate panel positions
              const totalScrollWidth = panelsContainerRef.current!.offsetWidth * (panels.length - 1) + panel2ExtraScroll + panel3ExtraScroll + panel4ExtraScroll;
              const panelWidth = panelsContainerRef.current!.offsetWidth;
              
              // Panel 5 centered = complete transitions through 4 panels + all pins + enough to fully show Panel 5
              // This puts Panel 5 fully in the middle of the viewport without Panel 4 visible
              const scrollToPanel5Start = panelWidth * 4 + panel2ExtraScroll + panel3ExtraScroll + panel4ExtraScroll;
              const panel5Centered = (scrollToPanel5Start + panelWidth * 0.417) / totalScrollWidth;
              
              // Only snap to Panel 5 if:
              // 1. Close to it (within 12% proximity)
              // 2. AND approaching from the left (progress < panel5Centered + 0.06)
              // This allows scrolling past to Panel 6 without snapping back
              if (progress < (panel5Centered + 0.06) && Math.abs(progress - panel5Centered) < 0.12) {
                return panel5Centered;
              }
              
              // Otherwise don't snap
              return progress;
            },
            duration: 0.6,
            ease: "power2.inOut"
          },
          end: () => `+=${panelsContainerRef.current!.offsetWidth * (panels.length - 1) + panel2ExtraScroll + panel3ExtraScroll + panel4ExtraScroll}`,
          id: "horizontal-scroll"
        }
      });

      // Calculate scroll percentages
      const totalScrollWidth = panelsContainerRef.current!.offsetWidth * (panels.length - 1) + panel2ExtraScroll + panel3ExtraScroll + panel4ExtraScroll;
      const panelWidth = panelsContainerRef.current!.offsetWidth;
      const panel2PinDuration = panel2ExtraScroll;
      const panel3PinDuration = panel3ExtraScroll;
      
      // Move all panels until Panel 2 is in view (Panel 0 -> Panel 1)
      horizontalScrollTL.to(panels, {
        xPercent: -100,
        ease: "none",
        duration: panelWidth / totalScrollWidth
      }, 0);

      // Hold Panel 2 in place while cards scroll
      const panel2PinStart = horizontalScrollTL.duration();
      horizontalScrollTL.to(panels, {
        xPercent: -100,
        ease: "none",
        duration: panel2PinDuration / totalScrollWidth
      });
      const panel2PinEnd = horizontalScrollTL.duration();

      // Move to Panel 3 (Panel 1 -> Panel 2)
      horizontalScrollTL.to(panels, {
        xPercent: -200,
        ease: "none",
        duration: panelWidth / totalScrollWidth
      });

      // Hold Panel 3 in place while feed scrolls
      const panel3PinStart = horizontalScrollTL.duration(); // Get current timeline position
      horizontalScrollTL.to(panels, {
        xPercent: -200,
        ease: "none",
        duration: panel3PinDuration / totalScrollWidth
      });
      const panel3PinEnd = horizontalScrollTL.duration(); // Get position after panel3 pin
      
      // Move to Panel 4 (Gamification) (Panel 2 -> Panel 3)
      const panel4SlideStart = horizontalScrollTL.duration(); // Card animations start here
      horizontalScrollTL.to(panels, {
        xPercent: -300,
        ease: "none",
        duration: panelWidth / totalScrollWidth
      });

      // Hold Panel 4 in place while cards scale in and out
      const panel4PinStart = horizontalScrollTL.duration();
      const panel4PinDuration = panel4ExtraScroll;
      horizontalScrollTL.to(panels, {
        xPercent: -300,
        ease: "none",
        duration: panel4PinDuration / totalScrollWidth
      });
      const panel4PinEnd = horizontalScrollTL.duration();
      
      console.log('Timeline positions:', {
        panel2PinStart,
        panel2PinEnd,
        panel2Duration: panel2PinEnd - panel2PinStart,
        panel3PinStart,
        panel3PinEnd,
        panel3Duration: panel3PinEnd - panel3PinStart,
        panel4SlideStart,
        panel4PinStart,
        panel4PinEnd,
        panel4Duration: panel4PinEnd - panel4PinStart,
        totalDuration: horizontalScrollTL.duration()
      });

      // Panel 3 feed animation - ADD DIRECTLY TO MAIN TIMELINE
      if (panel3FeedRef.current) {
        const feed = panel3FeedRef.current;
        const feedContainer = feed.parentElement;
        
        // Debug: Check initial positions
        console.log('Panel3 feed initial state:', {
          feedScrollTop: feed.scrollTop,
          feedOffsetTop: feed.offsetTop,
          feedScrollHeight: feed.scrollHeight,
          feedClientHeight: feed.clientHeight,
          containerScrollTop: feedContainer?.scrollTop,
          containerOffsetTop: feedContainer?.offsetTop
        });
        
        // Force reset any scroll positions
        feed.scrollTop = 0;
        if (feedContainer) feedContainer.scrollTop = 0;
        
        // Force feed to start at top (y: 0) - important!
        gsap.set(feed, { y: 0, x: 0, force3D: true, clearProps: 'all' });
        
        // Use pre-calculated panel3ScrollDistance (NOT recalculate here!)
        const totalPinDuration = panel3PinEnd - panel3PinStart;
        
        console.log('Panel3 animation USING PRE-CALC:', {
          panel3ScrollDistance,
          totalPinDuration,
          panel3PinStart,
          panel3PinEnd,
          scrollY: -panel3ScrollDistance,
          NOTE: 'Feed starts at y:0, scrolls to y:-' + panel3ScrollDistance
        });
        
        // Feed scrolls using pre-calculated distance
        horizontalScrollTL.fromTo(feed,
          { y: 0 },
          {
            y: -panel3ScrollDistance,  // ← USE PRE-CALCULATED VALUE!
            ease: "none",
            duration: totalPinDuration,
            force3D: true
          },
          panel3PinStart
        );
        
        // Animate title and description on Panel 3 entry (VERY early for backward, normal for leave)
        const title = panel3Ref.current?.querySelector('.panel3-title');
        const descriptionLines = panel3Ref.current?.querySelectorAll('.panel3-desc-line');
        
        if (title) {
          gsap.set(title, { opacity: 0, y: 30 });
          gsap.to(title, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel3Ref.current,
              containerAnimation: horizontalScrollTL,
              start: "left right-=30%", // Forward enter: Start 30% early
              end: "right left+=15%", // Backward enter VERY early (panel only needs 10% visible!)
              toggleActions: "play reverse play reverse", // Full bidirectional animation
              once: false
            }
          });
        }
        
        // Animate description lines with stagger (VERY early for backward, normal for leave)
        if (descriptionLines && descriptionLines.length > 0) {
          gsap.set(descriptionLines, { y: '120%', opacity: 0 });
          
          gsap.to(descriptionLines, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel3Ref.current,
              containerAnimation: horizontalScrollTL,
              start: "left right-=30%", // Forward enter: Start 30% early
              end: "right left+=10%", // Backward enter VERY early (panel only needs 10% visible!)
              toggleActions: "play reverse play reverse", // Full bidirectional animation
              once: false
            }
          });
        }
      }

      // Panel 4: Gamification - Flower blooming animation for cards
      if (panel4Ref.current) {
        const cards = panel4Ref.current.querySelectorAll('.gamification-card');
        
        // Animation sequence following the arrow pattern (clockwise):
        // 1. Daily task (bottom - index 2)
        // 2. Racing top (top-left - index 0)
        // 3. Tracking (top-right - index 1)
        const animationSequence = [2, 0, 1]; // Order: Daily task -> Racing top -> Tracking
        
        // Set initial states for all cards
        cards.forEach((card, index) => {
          if (index === 0) {
            // Racing top card: scale from bottom-right corner
            gsap.set(card, {
              transformOrigin: "bottom right",
              scale: 0.1,
              x: 0,
              y: 0,
              opacity: 0
            });
          } else if (index === 1) {
            // Tracking card: scale from bottom-left corner
            gsap.set(card, {
              transformOrigin: "bottom left",
              scale: 0.1,
              x: 0,
              y: 0,
              opacity: 0
            });
          } else if (index === 2) {
            // Daily task card: scale from top-right corner
            gsap.set(card, {
              transformOrigin: "top right",
              scale: 0.1,
              x: 0,
              y: 0,
              opacity: 0
            });
          }
          
          // Set initial state for card content
          const cardContent = card.querySelectorAll('svg, div');
          gsap.set(cardContent, {
            opacity: 0
          });
        });
        
        // Calculate durations for card animations within the pin
        const cardAnimDuration = (panel4PinDuration * 0.35) / totalScrollWidth; // 35% of pin for each card scale in (slower)
        const holdDuration = (panel4PinDuration * 0.25) / totalScrollWidth; // 25% hold all cards
        const staggerOffset = cardAnimDuration * 0.4; // Each card starts 40% into previous card
        
        // Animate cards with staggered start points for sequential appearance
        animationSequence.forEach((cardIndex, sequenceIndex) => {
          if (cards[cardIndex]) {
            const card = cards[cardIndex];
            const cardContent = card.querySelectorAll('svg, div');
            
            // Calculate timing for this card - start as soon as Panel 4 enters viewport
            const cardStartTime = panel4SlideStart + (sequenceIndex * staggerOffset);
            const cardEndTime = cardStartTime + cardAnimDuration;
            
            // Calculate reverse timing for disappear (reverse order)
            const reverseSequenceIndex = 2 - sequenceIndex;
            const cardOutStartTime = panel4PinEnd - cardAnimDuration - (reverseSequenceIndex * staggerOffset);
            
            // Determine transform origin based on card
            let transformOrigin = "center center";
            if (cardIndex === 0) transformOrigin = "bottom right"; // Racing top
            else if (cardIndex === 1) transformOrigin = "bottom left"; // Tracking
            else if (cardIndex === 2) transformOrigin = "top right"; // Daily task
            
            // Scale IN animation
            horizontalScrollTL.to(card, {
              transformOrigin: transformOrigin,
              scale: 1,
              x: 0,
              y: 0,
              opacity: 1,
              ease: "power1.inOut",
              duration: cardAnimDuration
            }, cardStartTime);
            
            // Scale OUT animation
            horizontalScrollTL.to(card, {
              transformOrigin: transformOrigin,
              scale: 0.1,
              x: 0,
              y: 0,
              opacity: 0,
              ease: "power1.inOut",
              duration: cardAnimDuration
            }, cardOutStartTime);
            
            // Card content fade-in
            if (cardContent.length > 0) {
              horizontalScrollTL.to(cardContent, {
                opacity: 1,
                ease: "power2.out",
                duration: cardAnimDuration * 0.5
              }, cardStartTime + cardAnimDuration * 0.4);
              
              // Card content fade-out
              horizontalScrollTL.to(cardContent, {
                opacity: 0,
                ease: "power2.in",
                duration: cardAnimDuration * 0.5
              }, cardOutStartTime);
            }
          }
        });
        
        // Animate title and description on Panel 4 entry
        const title = panel4Ref.current?.querySelector('.panel4-title');
        const descriptionLines = panel4Ref.current?.querySelectorAll('.panel4-desc-line');
        
        if (title) {
          gsap.set(title, { opacity: 0, y: 30 });
          gsap.to(title, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel4Ref.current,
              containerAnimation: horizontalScrollTL,
              start: "left center-=20%", // Start when panel is centered
              end: "right left+=15%", // Reverse early when leaving
              toggleActions: "play reverse play reverse",
              once: false
            }
          });
        }
        
        // Animate description lines with stagger
        if (descriptionLines && descriptionLines.length > 0) {
          gsap.set(descriptionLines, { y: '120%', opacity: 0 });
          
          gsap.to(descriptionLines, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel4Ref.current,
              containerAnimation: horizontalScrollTL,
              start: "left center-=15%", // Start when panel is nearly centered
              end: "right left+=10%", // Reverse early when leaving
              toggleActions: "play reverse play reverse",
              once: false
            }
          });
        }
      }

      // Panel 5: Chat typing animation
      // Create a ScrollTrigger to detect when Panel 5 is snapped/visible
      if (panel5Ref.current) {
        ScrollTrigger.create({
          trigger: panel5Ref.current,
          containerAnimation: horizontalScrollTL,
          start: "left center",
          onEnter: () => {
            if (!chatAnimationTriggered.current) {
              chatAnimationTriggered.current = true;
              // Delay the conversation start by 800ms after snap
              setTimeout(() => {
                startChatTypingAnimation();
              }, 1200);
            }
          }
        });
      }

      // Reset chat when scrolling back to Panel 1
      if (panel2Ref.current) {
        ScrollTrigger.create({
          trigger: panel2Ref.current,
          containerAnimation: horizontalScrollTL,
          start: "right right",
          onEnterBack: () => {
            // Reset chat state when scrolling back to beginning
            chatAnimationTriggered.current = false;
            setChatMessages([]);
            setShakeCTA(false);
          }
        });
      }

      // Continue scrolling remaining panels (after Panel 5)
      const remainingPanels = panels.length - 5; // Panels after 0, 1, 2, 3, 4 (Hero, Panel2, Panel3, Panel4, Panel5)
      if (remainingPanels > 0) {
        horizontalScrollTL.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: "none",
          duration: (panelWidth * remainingPanels) / totalScrollWidth
        });
      }

      // Panel 2 specific animations - ADD DIRECTLY TO MAIN TIMELINE
      if (panel2Ref.current && panel2TextRef.current && panel2CarouselRef.current) {
        const cards = panel2CarouselRef.current.querySelectorAll('.card-item');
        const textLines = panel2TextRef.current.querySelectorAll('h2');
        const chars = panel2TextRef.current.querySelectorAll('.panel2-char');
        
        // Set initial positions - cards visible
        gsap.set(panel2CarouselRef.current, { x: 0, opacity: 1 });
        gsap.set(cards, { opacity: 1 });
        
        // Set initial state for text container
        gsap.set(panel2TextRef.current, { opacity: 1 });
        
        // Set initial state for each line (slide from right)
        gsap.set(textLines, { 
          x: 200,  // Start lines from the right
          opacity: 0 
        });
        
        // Set initial state for each character
        gsap.set(chars, { 
          opacity: 0, 
          x: 80,  // Start from the right (positive value)
          y: 50, 
          rotation: 10,  // Positive rotation for right-to-left
          scale: 0.5 
        });
        
        // Calculate text animation start time - start MUCH earlier!
        const textAnimDuration = 0.2; // Increased duration (was 0.15)
        const textAnimStart = Math.max(0, panel2PinStart - textAnimDuration * 0.8); // Start much earlier (was 0.3)
        
        // Phase 1a: Slide in the whole lines - ADD TO MAIN TIMELINE
        // "We are" slides in first
        horizontalScrollTL.to(textLines[0], {
          x: 0,
          opacity: 1,
          duration: textAnimDuration * 0.5, // Longer duration (was 0.4)
          ease: "power2.out"
        }, textAnimStart);
        
        // "BRIGHTNEST" slides in when "We are" is at 5%
        horizontalScrollTL.to(textLines[1], {
          x: 0,
          opacity: 1,
          duration: textAnimDuration * 0.6, // Longer duration (was 0.5)
          ease: "power2.out"
        }, textAnimStart + textAnimDuration * 0.025);
        
        // Phase 1b: Animate characters - ADD TO MAIN TIMELINE
        horizontalScrollTL.to(chars, {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          stagger: textAnimDuration * 0.025, // Much slower stagger for smoother appearance
          duration: textAnimDuration * 0.8, // Longer duration for each character
          ease: "back.out(1.7)"
        }, textAnimStart);

        // Phase 2: Cards scroll - ADD TO MAIN TIMELINE spanning entire panel2 pin
        const scrollDistance = -(totalCardsWidth - window.innerWidth + 160);
        
        console.log('Panel2 carousel direct timeline:', {
          totalCardsWidth,
          scrollDistance,
          panel2PinStart,
          panel2PinEnd,
          panel2Duration: panel2PinEnd - panel2PinStart,
          textAnimStart,
          textAnimDuration
        });
        
        // Add carousel scroll spanning ENTIRE panel2 pin duration
        horizontalScrollTL.fromTo(panel2CarouselRef.current,
          { x: 0 },
          {
            x: scrollDistance,
            ease: "none",
            duration: panel2PinEnd - panel2PinStart
          },
          panel2PinStart // Start exactly when pin starts
        );
      }

      // Panel 3 feed animation - already integrated directly into main timeline above

      // Set initial state for all panel content to be visible
      panels.forEach((panel) => {
        const content = panel.querySelector(".panel-content");
        if (content) {
          gsap.set(content, { opacity: 1 });
        }
      });

      // Animate content within each panel on entry (skip panels 0 and 1)
      panels.forEach((panel, index) => {
        const content = panel.querySelector(".panel-content");
        if (content && index > 1) {
          gsap.from(content, {
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalScrollTL,
              start: "left center",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power2.out",
          });
        }
      });
    };

    // Run immediately
    initAnimations();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (panel6Ref.current) {
        const rect = panel6Ref.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // For horizontal scroll: check if footer panel is currently visible
        // Footer is visible when its left edge is less than window width
        // and right edge is greater than 0
        const horizontallyVisible = rect.left < windowWidth && rect.right > 0;
        
        // Footer is significantly in view when at least 30% of it is visible
        const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
        const footerWidth = rect.width;
        const visibilityRatio = footerWidth > 0 ? visibleWidth / footerWidth : 0;
        
        setShowScrollToTop(horizontallyVisible && visibilityRatio > 0.3);
      }
    };

    // Listen to both scroll and resize events
    window.addEventListener('scroll', handleScroll, true); // Use capture phase
    window.addEventListener('resize', handleScroll);
    
    // For horizontal scroll, also check on interval
    const interval = setInterval(handleScroll, 100);
    
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <style>
        {`
          @keyframes shake {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(2deg); }
            20% { transform: rotate(-2deg); }
            30% { transform: rotate(2deg); }
            40% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
            60% { transform: rotate(-2deg); }
            70% { transform: rotate(2deg); }
            80% { transform: rotate(-2deg); }
            90% { transform: rotate(1deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
      <AppHeader />
      
      <div ref={containerRef} className="relative overflow-x-hidden">
        <div
          ref={panelsContainerRef}
          className="flex w-full h-screen overflow-y-visible"
          style={{ gap: 0, margin: 0, padding: 0 }}
        >
          {/* Panel 1: Hero */}
          <section
            className="panel relative w-full h-screen flex-shrink-0"
            style={{
              background: "linear-gradient(270deg, #e2f043 0%, #05644c 90%)",
            }}
          >
            <div className="absolute inset-0 h-full w-full flex flex-col justify-center items-end pr-20">
              <div className="max-w-[800px] relative z-50 mr-16">
          <h1
            ref={heroTitleRef}
            className="hero-title text-white text-[80px] leading-tight mb-6 text-right whitespace-nowrap"
            style={{
              fontFamily: "Pacifico, cursive",
              perspective: "1000px",
              textShadow: "3px 3px 6px rgba(0,0,0,0.4)"
            }}
          >
            <span className="word inline-block mr-5" style={{ opacity: 0 }}>Pick</span>
            <span className="word inline-block mr-5" style={{ opacity: 0 }}>Your</span>
            <span className="word inline-block mr-5" style={{ opacity: 0 }}>Favorite</span>
            <span className="word inline-block" style={{ opacity: 0 }}>Sport</span>
          </h1>
                
                {/* Left-aligned content group */}
                <div className="flex flex-col items-start">
                  {/* Tagline with character animation */}
                  <p 
                    ref={taglineRef}
                    className="tagline-headline text-white/90 text-2xl font-semibold mb-6"
                    style={{ 
                      fontFamily: "DM Sans, sans-serif",
                      paddingLeft: "20px",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                      opacity: 0,
                      willChange: "transform",
                      transform: "translateZ(0)"
                    }}
                  >
                    Track your wellness journey with AI-powered insights
                  </p>

                  <div ref={emojiGroupRef} className="flex gap-5" style={{ opacity: 0 }}>
                    {/* Gym/Fitness */}
                    <div 
                      className="draggable-emoji w-[90px] h-[90px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-600 rounded-full shadow-lg hover:shadow-xl transition-shadow" 
                      data-color-theme="gym"
                    >
                      <FitnessCenterIcon 
                        sx={{ 
                          fontSize: 55, 
                          color: 'white',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }} 
                      />
                    </div>
                    
                    {/* Basketball */}
                    <div 
                      className="draggable-emoji w-[90px] h-[90px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 rounded-full shadow-lg hover:shadow-xl transition-shadow" 
                      data-color-theme="basketball"
                    >
                      <SportsBasketballIcon 
                        sx={{ 
                          fontSize: 55, 
                          color: 'white',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }} 
                      />
                    </div>
                    
                    {/* Swimming */}
                    <div 
                      className="draggable-emoji w-[90px] h-[90px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-shadow" 
                      data-color-theme="swimming"
                    >
                      <PoolIcon 
                        sx={{ 
                          fontSize: 55, 
                          color: 'white',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }} 
                      />
              </div>
                    
                    {/* Cycling */}
                    <div 
                      className="draggable-emoji w-[90px] h-[90px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-shadow" 
                      data-color-theme="cycling"
                    >
                      <DirectionsBikeIcon 
                        sx={{ 
                          fontSize: 55, 
                          color: 'white',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }} 
                      />
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div ref={ctaButtonsRef} className="flex gap-4 mt-12">
                  <button
                    onClick={() => navigate("/auth?mode=signin")}
                    className="px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #05644c 0%, #0a8f6f 100%)",
                      color: "white",
                      fontFamily: "DM Sans, sans-serif",
                      opacity: 0
                    }}
                  >
                    Start Your Journey
                  </button>
                  </div>
              </div>
              </div>
            </div>

            {/* Floating Particles/Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
              <div className="floating-orb absolute w-32 h-32 rounded-full bg-white/10 blur-xl" style={{ top: "15%", left: "10%" }} />
              <div className="floating-orb absolute w-24 h-24 rounded-full bg-[#e2f043]/20 blur-lg" style={{ top: "60%", left: "15%" }} />
              <div className="floating-orb absolute w-40 h-40 rounded-full bg-white/10 blur-2xl" style={{ top: "40%", right: "10%" }} />
              <div className="floating-orb absolute w-20 h-20 rounded-full bg-[#05644c]/30 blur-lg" style={{ top: "75%", right: "25%" }} />
              <div className="floating-orb absolute w-28 h-28 rounded-full bg-white/15 blur-xl" style={{ top: "25%", right: "40%" }} />
          </div>

            {/* Decorative elements - positioned absolutely on the left */}
          <img
              ref={foxRef}
              className="absolute bottom-[100px] left-[86px] w-[500px] h-auto z-10 pointer-events-none"
              style={{ transform: "rotate(-10.633deg)" }}
            src="https://api.builder.io/api/v1/image/assets/TEMP/9e48ea33ceadf9e90f946b17a07cc7729d8c8c34?width=1156"
            alt="Fox"
          />
        </section>

          {/* Panel 2: About BRIGHTNEST with Card Carousel */}
          <section
            ref={panel2Ref}
            className="panel relative w-full h-screen flex-shrink-0 overflow-hidden"
            style={{
              background: "linear-gradient(0deg, rgba(212, 212, 47, 0.5) 10%, rgba(80, 191, 165, 0.42) 100%)",
            }}
          >
            {/* Fixed Header Section */}
            <div ref={panel2TextRef} className="absolute top-20 left-20 z-20">
                <h2
                className="text-[#046753] text-[110px] font-bold leading-[0.9] text-left"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                <span className="panel2-char inline-block">W</span>
                <span className="panel2-char inline-block">e</span>
                <span className="panel2-char inline-block">&nbsp;</span>
                <span className="panel2-char inline-block">a</span>
                <span className="panel2-char inline-block">r</span>
                <span className="panel2-char inline-block">e</span>
                </h2>
              <h2
                className="text-[#046753] text-[130px] font-bold leading-[0.9] text-left"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                <span className="panel2-char inline-block">B</span>
                <span className="panel2-char inline-block">R</span>
                <span className="panel2-char inline-block">I</span>
                <span className="panel2-char inline-block">G</span>
                <span className="panel2-char inline-block">H</span>
                <span className="panel2-char inline-block">T</span>
                <span className="panel2-char inline-block text-white">N</span>
                <span className="panel2-char inline-block text-white">E</span>
                <span className="panel2-char inline-block text-white">S</span>
                <span className="panel2-char inline-block text-white">T</span>
              </h2>
            </div>

            {/* Scrollable Card Carousel */}
            <div className="panel-content absolute inset-0 flex items-center px-20 pt-[300px] overflow-hidden">
              <div ref={panel2CarouselRef} className="card-carousel-container w-full flex items-center gap-8 pb-8">
                    {/* Card 1 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/track_progress_final.jpg" 
                        alt="Track Your Progress" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Track Your Progress
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Monitor your fitness journey with AI-powered insights and detailed analytics
                        </p>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/community_final.jpg" 
                        alt="Community Support" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Community Support
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Connect with like-minded health enthusiasts and share your journey
                        </p>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/metric_final.jpg" 
                        alt="Analytics" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Health Metrics
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Visualize your health data with comprehensive metrics and charts
                        </p>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/personal_coach_final.jpg" 
                        alt="AI Personal Coach" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          AI Personal Coach
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Get personalized health recommendations powered by artificial intelligence
                        </p>
                      </div>
                    </div>

                    {/* Card 5 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/track_progress_final.jpg" 
                        alt="Track Analytics" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Daily Challenges
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Complete daily tasks and challenges to stay motivated and consistent
                        </p>
                      </div>
                    </div>

                    {/* Card 6 */}
                    <div 
                      className="card-item flex-shrink-0 w-[400px] h-[380px] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 relative group"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <img 
                        src="/foxcard/achivement.jpg" 
                        alt="Achievements" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Achievements
                        </h3>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                          Unlock badges and celebrate your fitness milestones along the way
                        </p>
                      </div>
                    </div>
              </div>
            </div>
        </section>

          {/* Panel 3: Services with Social Feed */}
          <section
            ref={panel3Ref}
            className="panel relative w-full flex-shrink-0 overflow-hidden"
            style={{
              background: "linear-gradient(113deg, rgba(208, 223, 0, 0.72) 23.72%, #ffaf72 100%)",
              margin: 0,
              padding: 0,
              height: '100vh',
              minHeight: '100vh',
              maxHeight: '100vh'
            }}
          >
            {/* Logo as background with opacity */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/assets/brightnesslogo.png')",
                backgroundPosition: "center",
                backgroundSize: "540px auto",
                backgroundRepeat: "no-repeat",
                opacity: 0.15,
                zIndex: 0
              }}
            />
            <div style={{ 
              width: '100%',
              height: '100%', 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              margin: 0,
              paddingTop: '120px', 
              paddingBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              position: 'relative',
              zIndex: 10
            }}>
                {/* Left side - Vertical Scrolling Feed */}
                <div style={{ 
                  position: 'relative',
                  height: '100%', 
                  overflow: 'hidden', 
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexShrink: 0,
                  width: '480px', 
                  paddingLeft: '60px',
                  paddingTop: '0',
                  marginLeft: 0 
                }}>
                  <div 
                    ref={panel3FeedRef} 
                    className="space-y-4 pr-2 w-full" 
                    style={{ 
                      transform: 'translateY(0)', 
                      willChange: 'transform'
                    }}
                  >
                    {/* Post 1 - With Image */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=1" 
                          alt="Maria Chen"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            Maria Chen
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            2 hours ago
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Just completed my 30-day fitness challenge! Down 5kg and feeling amazing!
                      </p>
                      <img 
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=300&fit=crop" 
                        alt="Fitness"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 124
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 23
                        </span>
                      </div>
                    </div>

                    {/* Post 2 - Text Only */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=12" 
                          alt="John Smith"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            John Smith
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            5 hours ago
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Morning run with the squad! 10km done. Who's joining tomorrow?
                      </p>
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 89
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 15
                        </span>
                      </div>
                    </div>

                    {/* Post 3 - With Image */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=5" 
                          alt="Sarah Johnson"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            Sarah Johnson
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            8 hours ago
                          </p>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Healthy Meal Prep Ideas
                  </h3>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        New healthy meal prep recipe! Check out my profile for the full guide.
                      </p>
                      <img 
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop" 
                        alt="Healthy food"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 156
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 42
                        </span>
              </div>
                    </div>

                    {/* Post 4 - Text Only */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=33" 
                          alt="David Lee"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            David Lee
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            1 day ago
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Reached my goal of 10,000 steps every day this month! Consistency is key!
                      </p>
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 201
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 31
                        </span>
                      </div>
                    </div>

                    {/* Post 5 - With Image */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=9" 
                          alt="Emma Wilson"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            Emma Wilson
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            1 day ago
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Yoga session at sunrise. Best way to start the day! Namaste.
                      </p>
                      <img 
                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop" 
                        alt="Yoga"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 178
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 19
                        </span>
                      </div>
                    </div>

                    {/* Post 6 - Multi Images */}
                    <div 
                      className="rounded-xl p-5 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        border: "1px solid rgba(44, 124, 74, 0.2)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start mb-3">
                        <img 
                          src="https://i.pravatar.cc/150?img=20" 
                          alt="Alex Chen"
                          className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight mb-1 truncate text-left" style={{ fontFamily: "DM Sans, sans-serif" }}>
                            Alex Chen
                          </h4>
                          <p className="text-xs text-black leading-tight text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                            2 days ago
                          </p>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-2 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Weekend Workout Highlights
                      </h3>
                      <p className="text-sm leading-relaxed text-black mb-3 break-words text-left" style={{ fontFamily: "DM Sans, sans-serif", color: "#000000" }}>
                        Great weekend training with the crew! Swimming, cycling, and strength training.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <img 
                          src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=250&h=200&fit=crop" 
                          alt="Swimming"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=250&h=200&fit=crop" 
                          alt="Gym"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex gap-4 text-sm text-black justify-start items-center" style={{ color: "#000000" }}>
                        <span className="flex items-center gap-1">
                          <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} /> 245
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleIcon sx={{ fontSize: 16, color: '#6b7280' }} /> 56
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right side - Description */}
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  paddingLeft: '48px', 
                  paddingRight: '64px',
                  paddingTop: '70px'
                }}>
                  <h3
                    className="panel3-title text-[#046753] text-[160px] font-bold mb-12 leading-[0.85]"
                    style={{ fontFamily: "DM Sans, sans-serif", opacity: 0 }}
                  ><p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "80px", lineHeight: "0.85" }}>
                    Social Health Feed
                    </p>
                  </h3>
                  <div className="panel3-description text-black text-xl leading-[1.8] font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {/* Line 1 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        Connect with others on their wellness journey. Share your progress,
                      </div>
                    </div>
                    {/* Line 2 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        celebrate achievements, and get inspired by real stories from our
                      </div>
                    </div>
                    {/* Line 3 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        vibrant community. Join thousands of members who are transforming
                      </div>
                    </div>
                    {/* Line 4 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        their lives together through support, motivation, and shared
                      </div>
                    </div>
                    {/* Line 5 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        experiences. Every post tells a story of dedication, every comment
                      </div>
                    </div>
                    {/* Line 6 */}
                    <div className="overflow-hidden mb-1">
                      <div className="panel3-desc-line">
                        sparks encouragement, and every like celebrates a milestone on the
                      </div>
                    </div>
                    {/* Line 7 */}
                    <div className="overflow-hidden">
                      <div className="panel3-desc-line">
                        path to better health.
                      </div>
                    </div>
                </div>
              </div>
            </div>
        </section>{/* Panel 4: Gamification */}<section
            ref={panel4Ref}
            className="panel relative w-full h-screen flex-shrink-0"
            style={{
              background: "linear-gradient(113deg, #ffaf72 0%, #ffd5a3 87.59%)",
              margin: 0,
              marginLeft: '-2px',
              padding: 0
            }}
          >
            <div className="panel-content h-full flex items-center justify-center px-12 pr-52">
              <div className="flex items-center gap-16 w-full max-w-[1300px] mx-auto">
                {/* Left: 2x2 Card Grid */}
                <div className="grid grid-cols-2 gap-6 w-[400px] h-[400px] place-items-center flex-shrink-0">
                  {/* Racing top card - Top Left */}
                  <div className="gamification-card w-[180px] h-[180px] bg-white border-2 border-[#ff7b17] flex flex-col items-center justify-center p-5 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ borderRadius: "100px 100px 0 100px", alignSelf: "center", justifySelf: "center" }}>
                    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                    <g transform="translate(12,0)">
                        <rect x="26" y="28" width="24" height="40" rx="8" stroke="#FF7B17" strokeWidth="4" />
                        <rect x="44" y="18" width="24" height="50" rx="8" stroke="#FF7B17" strokeWidth="4" />
                        <rect x="10" y="36" width="24" height="32" rx="8" stroke="#FF7B17" strokeWidth="4" />
                    </g>
                  </svg>
                    <div className="text-[#ff7b17] text-lg font-bold mt-2.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Racing top
                    </div>
                  </div>

                  {/* Tracking card - Top Right */}
                  <div className="gamification-card w-[180px] h-[180px] bg-white border-2 border-[#ff7b17] flex flex-col items-center justify-center p-5 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ borderRadius: "100px 100px 100px 0" }}>
                    <svg width="120" height="96" viewBox="0 0 120 96" fill="none">
                    <circle cx="24" cy="60" r="10" fill="#FF7B17" />
                      <path d="M36 60 C 60 50, 70 50, 90 60" stroke="#FF7B17" strokeWidth="4" strokeDasharray="8 10" fill="none" />
                      <path d="M96 24c-8.837 0-16 7.163-16 16 0 12 16 28 16 28s16-16 16-28c0-8.837-7.163-16-16-16Z" stroke="#FF7B17" strokeWidth="4" fill="none" />
                    <circle cx="96" cy="40" r="6" fill="#FF7B17" />
                  </svg>
                    <div className="text-[#ff7b17] text-lg font-bold mt-2.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Tracking
                    </div>
                  </div>

                  {/* Daily task card - Bottom Left */}
                  <div className="gamification-card w-[180px] h-[180px] bg-white border-2 border-[#ff7b17] flex flex-col items-center justify-center p-5 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300" style={{ borderRadius: "100px 0 100px 100px" }}>
                    <svg width="96" height="96" viewBox="0 0 68 80" fill="none">
                      <path d="M34 62H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                      <path d="M34 39.5898H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                      <path d="M34 16H56.695" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                      <rect x="2" y="2" width="64" height="75.3333" rx="8" stroke="#FF7B17" strokeWidth="4" />
                      <path d="M13.6 16.94L19 20.61L25.7 12.47" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                      <path d="M13.6 39.61L19 43.28L25.7 35.13" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                      <path d="M13.6 61.14L19 64.81L25.7 56.67" stroke="#FF7B17" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="text-[#ff7b17] text-lg font-bold mt-2.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Daily task
                    </div>
                  </div>

                  {/* Empty space - Bottom Right (placeholder for 4th card if needed) */}
                  <div className="w-[180px] h-[180px]"></div>
                </div>

                {/* Right: Text Content */}
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '650px'
                }}>
                  <p
                    className="panel4-title font-bold mb-12"
                    style={{ fontFamily: "DM Sans, sans-serif", fontSize: "80px", lineHeight: "0.85", opacity: 0, textAlign: 'left', color: "#046753" }}
                  >
                    Gamification
                  </p>
                  <div className="panel4-description" style={{ fontFamily: "DM Sans, sans-serif", textAlign: 'left' }}>
                    {/* Bullet 1 */}
                    <div className="overflow-hidden mb-3">
                      <div className="panel4-desc-line flex items-center gap-3">
                        <EmojiEventsIcon style={{ color: '#ff7b17', fontSize: '28px', flexShrink: 0 }} />
                        <span className="text-black text-lg font-semibold whitespace-nowrap">
                          Complete daily challenges and unlock achievements
                        </span>
                      </div>
                    </div>
                    {/* Bullet 2 */}
                    <div className="overflow-hidden mb-3">
                      <div className="panel4-desc-line flex items-center gap-3">
                        <TrendingUpIcon style={{ color: '#ff7b17', fontSize: '28px', flexShrink: 0 }} />
                        <span className="text-black text-lg font-semibold whitespace-nowrap">
                          Climb leaderboards and compete with friends
                        </span>
                      </div>
                    </div>
                    {/* Bullet 3 */}
                    <div className="overflow-hidden mb-3">
                      <div className="panel4-desc-line flex items-center gap-3">
                        <LocalFireDepartmentIcon style={{ color: '#ff7b17', fontSize: '28px', flexShrink: 0 }} />
                        <span className="text-black text-lg font-semibold whitespace-nowrap">
                          Track streaks and earn rewards for consistency
                        </span>
                      </div>
                    </div>
                    {/* Bullet 4 */}
                    <div className="overflow-hidden mb-3">
                      <div className="panel4-desc-line flex items-center gap-3">
                        <WorkspacePremiumIcon style={{ color: '#ff7b17', fontSize: '28px', flexShrink: 0 }} />
                        <span className="text-black text-lg font-semibold whitespace-nowrap">
                          Log workouts and achieve goals to level up
                        </span>
                      </div>
                    </div>
                    {/* Bullet 5 */}
                    <div className="overflow-hidden mb-3">
                      <div className="panel4-desc-line flex items-center gap-3">
                        <PeopleIcon style={{ color: '#ff7b17', fontSize: '28px', flexShrink: 0 }} />
                        <span className="text-black text-lg font-semibold whitespace-nowrap">
                          Join a community where progress becomes play
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

          {/* Panel 5: AI Chatbox & CTA */}
          <section
            ref={panel5Ref}
            className="panel relative w-full h-screen flex-shrink-0"
            style={{
              background: "linear-gradient(113deg, rgba(208, 223, 0, 0.72) 23.72%, #ffaf72 87.59%)",
            }}
          >
            <div className="panel-content h-full flex items-center justify-center px-12 pr-96">
              <div className="flex flex-col items-center justify-center w-full max-w-[900px]">
                <div className="text-center mb-10 panel5-header">
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "40px", lineHeight: "1.6", fontWeight: "bold", color: "#022c3c" }}>
                    Personalized AI Health Assistant just for you
                  </p>
                </div>

              {/* Chat Frame Container */}
              <div className="panel5-chatbox relative w-full mb-10">
                {/* Outer Frame with Border */}
                <div 
                  className="rounded-[32px] overflow-hidden shadow-2xl"
                  style={{ 
                    border: "4px solid #046753",
                    background: "white"
                  }}
                >
                  {/* Chat Messages Area */}
                  <div 
                    ref={chatMessagesContainerRef}
                    className="px-8 py-8 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden"
                    style={{ 
                      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%)",
                      height: "280px",
                      overflowY: "auto",
                      scrollBehavior: "smooth",
                      scrollbarWidth: "none", // Firefox
                      msOverflowStyle: "none" // IE and Edge
                    }}
                  >
                    {chatMessages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
                      >
                        {message.sender === 'bot' && (
                          <img src="/assets/Asset 10.svg" alt="Bot Avatar" className="w-[45px] h-[45px] object-contain flex-shrink-0" />
                        )}
                        <div 
                          className={`rounded-[20px] px-6 py-4 text-lg font-semibold shadow-md max-w-[75%] ${
                            message.isCTA ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''
                          } ${
                            message.sender === 'bot' 
                              ? 'bg-white rounded-tl-[4px] text-[#046753]' 
                              : 'rounded-tr-[4px] text-white'
                          }`}
                          style={{ 
                            fontFamily: "DM Sans, sans-serif",
                            background: message.isCTA 
                              ? 'linear-gradient(135deg, #ff7b17 0%, #ffaf72 100%)' 
                              : message.sender === 'user' 
                                ? 'linear-gradient(135deg, #076553 0%, #0a9b7a 100%)' 
                                : 'white',
                            color: message.isCTA ? 'white' : undefined,
                            animation: message.isCTA && shakeCTA ? 'shake 0.5s ease-in-out' : 'none'
                          }}
                          onClick={() => {
                            if (message.isCTA) {
                              window.location.href = '/signin';
                            }
                          }}
                        >
                          {message.isTyping && message.text === '' ? (
                            <div className="flex gap-1.5 py-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          ) : (
                            <div className={message.isCTA ? 'flex items-center gap-2' : ''}>
                              {message.text}
                              {message.isCTA && (
                                <ArrowForwardIcon sx={{ fontSize: '20px', color: 'white' }} />
                              )}
                            </div>
                          )}
                        </div>
                        {message.sender === 'user' && (
                          <img src="/assets/brightnesslogo.png" alt="User Avatar" className="w-[45px] h-[45px] rounded-full object-cover shadow-md flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    
                    {/* Empty state when no messages */}
                    {chatMessages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400 text-lg" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        Conversation will start when you scroll here...
                      </div>
                    )}
                  </div>

                  {/* Input Area (Visual Only) */}
                  <div 
                    className="px-8 py-4 flex items-center gap-3 border-t-2"
                    style={{ 
                      background: "white",
                      borderColor: "#e0e0e0"
                    }}
                  >
                    <div className="flex-1 bg-gray-100 rounded-full px-6 py-3 text-gray-400 text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Type your message...
                    </div>
                    <button 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                      style={{ background: "linear-gradient(135deg, #076553 0%, #0a9b7a 100%)" }}
                      onClick={handleShakeCTA}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                        <path d="M2 10L18 3L12 18L10 12L2 10Z" stroke="white" strokeWidth="2" fill="white"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
        </section>

          {/* Panel 6: Footer */}
          <section ref={panel6Ref} className="panel relative w-full flex-shrink-0 bg-[#05644c]" style={{ minHeight: '100vh' }}>
            <div className="panel-content w-full py-16">
              {/* Newsletter Section */}
              <div className="border-b border-white/20 pb-12 mb-12">
                <div className="max-w-7xl mx-auto px-8">
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                      <img
                        src="/assets/LogoWhite.png"
                        className="w-30 h-30"
                        alt="BrightNest Logo"
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3 text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        Join the BrightNest Community
                        </h3>
                        <p className="text-sm text-white/80 max-w-md leading-relaxed text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        Sign up to receive updates on new features, special offers, and fitness tips from BrightNest.
                        By subscribing, you agree to receive marketing emails and accept our {" "}
                          <a href="/privacy" className="text-white underline hover:text-white/90">Privacy Policy</a>.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="px-6 py-3 rounded-lg border border-white/30 focus:outline-none focus:border-white bg-white/10 text-white placeholder-white/50 w-80"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      />
                      <button className="px-8 py-3 bg-white text-[#05644c] rounded-lg hover:bg-white/90 transition-colors font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Subscribe
                      </button>
                    </div>
                  </div>
              </div>
                </div>

              {/* Links Section */}
              <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-6 gap-8 mb-12">
                  {/* Column 1: Tính năng */}
                <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Features
                    </h4>
                    <ul className="space-y-3 text-start">
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Workout Plans</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Personal AI Coach</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Health Tracking</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Challenges</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Community</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Premium Plans</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>Monthly Subscription</a></li>
                    </ul>
                  </div>

                  {/* Column 2: Nội dung */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Content
                    </h4>
                    <ul className="space-y-3 text-start">
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Cardio</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Strength</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Yoga</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Nutrition</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Health Tips</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>First Aid Videos</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Articles</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Health Library</a></li>
                    </ul>
                  </div>

                  {/* Column 3: Về chúng tôi */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    About Us
                    </h4>
                    <ul className="space-y-3 text-start">
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>About BrightNest</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Our Mission</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Team</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Press</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Careers</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Sitemap</a></li>
                    </ul>
                  </div>

                  {/* Column 4: Hỗ trợ */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-start" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Support
                    </h4>
                    <ul className="space-y-3 text-start">
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Help Center</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Contact Us</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>FAQs</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Privacy Policy</a></li>
                      <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Terms & Conditions</a></li>
                    </ul>
                  </div>

                  {/* Column 5: Tài khoản */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-center" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    Account
                    </h4>
                    <button className="w-full px-6 py-3 bg-white text-[#05644c] rounded-lg hover:bg-white/90 transition-colors font-medium text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Login
                    </button>
                  </div>

                  {/* Column 6: Tải ứng dụng */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-4 text-center" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      Download App
                    </h4>
                    <div className="space-y-3 flex flex-col items-center">
                      <a href="#" className="block">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-14 w-auto" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="pt-8 border-t border-white/20 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 text-sm text-white/80" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        <PhoneIcon sx={{ fontSize: 20 }} />
                        <span>0374479899 - Thảo Nguyên</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80" style={{ fontFamily: "DM Sans, sans-serif" }}>
                        <EmailIcon sx={{ fontSize: 20 }} />
                        <a href="mailto:brightnest@maildrop.cc" className="hover:text-white">brightnest@maildrop.cc</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    © 2025 BrightNest. All rights reserved.
                    </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href="https://www.facebook.com/profile.php?id=61581767391971" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                        <FacebookIcon sx={{ fontSize: 32, color: 'white' }} />
                      </a>
                      <a href="https://www.instagram.com/brightnest.fitness/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                        <InstagramIcon sx={{ fontSize: 32, color: 'white' }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>
        </div>
      </div>

      {/* Scroll Hint / Back to Top */}
      <div 
        className={`fixed bottom-8 right-8 z-50 ${showScrollToTop ? 'cursor-pointer' : ''}`}
        onClick={showScrollToTop ? scrollToTop : undefined}
      >
        <div className="flex items-center gap-2 text-white text-base font-bold">
          {showScrollToTop ? (
            <>
              <span className="animate-pushLeft text-2xl">←</span>
              <span className="animate-slideLeft">Back to top</span>
            </>
          ) : (
            <>
              <span className="animate-slideRight">Scroll to explore</span>
              <span className="animate-pushRight text-2xl">→</span>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          0%, 100% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(8px);
            opacity: 0.7;
          }
        }

        @keyframes pushRight {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          50% {
            transform: translateX(12px) scale(1.2);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-slideRight {
          animation: slideRight 2s ease-in-out infinite;
        }

        .animate-pushRight {
          animation: pushRight 2s ease-in-out infinite;
          display: inline-block;
        }

        @keyframes slideLeft {
          0%, 100% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-8px);
            opacity: 0.7;
          }
        }

        @keyframes pushLeft {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          50% {
            transform: translateX(-12px) scale(1.2);
          }
        }

        .animate-slideLeft {
          animation: slideLeft 2s ease-in-out infinite;
        }

        .animate-pushLeft {
          animation: pushLeft 2s ease-in-out infinite;
          display: inline-block;
        }

        /* Custom scrollbar for card carousel */
        .card-carousel-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(4, 103, 83, 0.3) transparent;
        }

        .card-carousel-container::-webkit-scrollbar {
          height: 8px;
        }

        .card-carousel-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .card-carousel-container::-webkit-scrollbar-thumb {
          background: rgba(4, 103, 83, 0.3);
          border-radius: 4px;
        }

        .card-carousel-container::-webkit-scrollbar-thumb:hover {
          background: rgba(4, 103, 83, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
