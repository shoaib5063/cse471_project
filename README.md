# MindfulMeals - Healthy Eating Assistant 🌱

**Track your meals, nourish your body, and discover mindful eating.**

MindfulMeals is an intelligent web-based health and nutrition tracking system designed to help users monitor, plan, and improve their eating habits through mindful awareness and personalized insights.

## 🎨 Design System

This project uses a vibrant color palette inspired by health and wellness:

### Primary Colors
- **Crimson** (#D7263D) - Energy, motivation, alerts
- **Lemonade** (#B8FB3C) - Growth, success, positive actions  
- **Electric** (#03045E) - Trust, stability, primary text
- **Nights** (#02182B) - Depth, premium features, dark themes

### Color Usage
- **Crimson**: Call-to-action buttons, warnings, energy indicators
- **Lemonade**: Success states, progress bars, achievements
- **Electric**: Primary text, navigation, professional elements
- **Nights**: Dark backgrounds, premium features, depth

## 🚀 Features Implemented

### Core UI Components
- **Button**: Multi-variant button system with hover animations
- **Card**: Flexible card component with gradient options
- **Input**: Form inputs with validation states
- **ProgressBar**: Animated progress indicators
- **Badge**: Status and category indicators

### Layout Components
- **Header**: Responsive navigation with authentication states
- **Footer**: Comprehensive site footer with links and branding

### Homepage Components
- **HeroBanner**: Animated hero section with floating elements
- **AnimatedBanners**: Sliding promotional banners (horizontal & vertical)

### Dashboard Components
- **CalorieTracker**: Comprehensive calorie and macro tracking with charts
- **MoodTracker**: Emotional eating awareness and logging

### Meal Logging
- **MealLogger**: Photo upload and manual entry system

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## 📱 Responsive Design

All components are built mobile-first with responsive breakpoints:
- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- Large: 1280px+

## 🎯 Key Design Principles

1. **Mindful Interactions**: Smooth animations that don't overwhelm
2. **Accessibility First**: High contrast ratios and keyboard navigation
3. **Visual Hierarchy**: Clear typography and spacing systems
4. **Emotional Design**: Colors and animations that motivate healthy choices

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
mindful-meals/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── meals/            # Meal logging pages
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── home/             # Homepage components
│   ├── dashboard/        # Dashboard-specific components
│   └── meals/            # Meal-related components
└── public/               # Static assets
```

## 🎨 Component Examples

### Button Usage
```tsx
<Button variant="crimson" size="lg">
  Start Journey
</Button>
```

### Card with Gradient
```tsx
<Card gradient="lemonade" hover>
  <h3>Nutrition Tip</h3>
  <p>Stay hydrated throughout the day!</p>
</Card>
```

### Progress Tracking
```tsx
<ProgressBar 
  progress={75} 
  color="lemonade" 
  label="Daily Goal" 
/>
```

## 🌟 Future Enhancements

- AI-powered food recognition
- Wearable device integration
- Community features
- Nutritionist consultation system
- Recipe recommendations
- Shopping list generation

## 📄 License

This project is built for educational and demonstration purposes.

---

**Made with ❤️ for healthier living**