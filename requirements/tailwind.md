# Tailwind CSS Best Practices

## Overview
This document outlines best practices for using Tailwind CSS in the Retro Reader PWA project. These guidelines ensure consistent, maintainable, and performant styling across the application.

## Core Principles

### 1. Utility-First Approach
- Use Tailwind's pre-defined utility classes directly in JSX
- Avoid creating custom CSS files unless absolutely necessary
- Embrace composition over inheritance

### 2. Component-Based Architecture
- Create reusable React components instead of duplicating class names
- Use components for repeated UI patterns rather than @apply directives
- Follow atomic design principles (atoms, molecules, organisms)

## Best Practices

### Performance Optimization

1. **Enable PurgeCSS**
   - Ensure unused CSS is removed in production builds
   - Configure content paths correctly in `tailwind.config.js`
   ```js
   content: [
     "./src/**/*.{js,jsx,ts,tsx}",
     "./public/index.html"
   ]
   ```

2. **Minimize Class Redundancy**
   - Create reusable components to avoid repeating long class strings
   - Use React.memo for components with stable props
   - Implement code-splitting with React.lazy for large components

### Component Development

1. **Prefer Components Over @apply**
   ```jsx
   // ✅ Good - Reusable component
   const Button = ({ children, variant = 'primary' }) => (
     <button className="px-4 py-2 rounded-lg font-semibold transition-colors">
       {children}
     </button>
   );

   // ❌ Avoid - Using @apply
   .btn {
     @apply px-4 py-2 rounded-lg font-semibold transition-colors;
   }
   ```

2. **Class Organization**
   - Group related utilities together
   - Order: positioning → display → spacing → typography → colors → effects
   ```jsx
   <div className="absolute top-0 left-0 flex items-center justify-center p-4 text-lg font-bold text-white bg-blue-500 rounded-lg shadow-lg">
   ```

### Responsive Design

1. **Mobile-First Approach**
   - Start with mobile styles, add larger breakpoints as needed
   - Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
   ```jsx
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

2. **Custom Breakpoints**
   - Define project-specific breakpoints in config if needed
   - Maintain consistency across the application

### Dark Mode Support

1. **Implementation**
   - Use `dark:` variant for dark mode styles
   - Configure dark mode in `tailwind.config.js`
   ```jsx
   <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
   ```

2. **Color Consistency**
   - Define semantic color variables in config
   - Use consistent color pairs for light/dark modes

### Configuration Best Practices

1. **Customize Design Tokens**
   ```js
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'retro-blue': '#0080FF',
           'retro-green': '#00FF00',
         },
         fontFamily: {
           'pixel': ['Press Start 2P', 'monospace'],
         }
       }
     }
   }
   ```

2. **Use CSS Variables for Dynamic Values**
   - Define CSS variables for runtime theming
   - Reference them in Tailwind config

### Code Maintainability

1. **Conditional Classes**
   - Use template literals or classnames/clsx library
   ```jsx
   // Using clsx
   import clsx from 'clsx';
   
   <div className={clsx(
     'base-classes',
     isActive && 'active-classes',
     isDisabled && 'disabled-classes'
   )}>
   ```

2. **Extract Complex Class Combinations**
   ```jsx
   const cardStyles = {
     base: 'rounded-lg shadow-md p-6',
     variants: {
       elevated: 'shadow-xl',
       flat: 'shadow-none border border-gray-200'
     }
   };
   ```

### Accessibility

1. **Focus States**
   - Always include focus styles for interactive elements
   - Use `focus:` and `focus-visible:` variants
   ```jsx
   <button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
   ```

2. **Screen Reader Support**
   - Use `sr-only` class for screen reader only content
   - Ensure proper color contrast ratios

### PWA-Specific Considerations

1. **Offline-First Styling**
   - Ensure critical styles are included in initial bundle
   - Avoid external font dependencies for offline functionality

2. **Touch-Friendly Design**
   - Use appropriate padding/margin for touch targets (min 44x44px)
   - Consider hover states that also work with touch

### Common Patterns

1. **Container Layout**
   ```jsx
   <div className="container mx-auto px-4 sm:px-6 lg:px-8">
   ```

2. **Card Component**
   ```jsx
   <div className="bg-white rounded-lg shadow-md overflow-hidden">
   ```

3. **Form Controls**
   ```jsx
   <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
   ```

## Anti-Patterns to Avoid

1. **Don't use @apply for everything** - It defeats the purpose of utility-first CSS
2. **Avoid inline styles** - Use Tailwind classes instead
3. **Don't create single-use components** - Components should be reusable
4. **Avoid arbitrary values when standard utilities exist**
5. **Don't mix Tailwind with custom CSS methodologies** (BEM, etc.)

## Testing Considerations

1. **Visual Regression Testing**
   - Use tools like Chromatic or Percy for UI testing
   - Test responsive breakpoints

2. **Component Testing**
   - Test component variants and states
   - Ensure accessibility compliance

## Performance Monitoring

1. **Bundle Size**
   - Monitor CSS bundle size in production
   - Use webpack-bundle-analyzer or similar tools

2. **Runtime Performance**
   - Avoid excessive DOM updates from class changes
   - Use CSS transitions instead of JavaScript animations

## Resources

- [Official Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Component Examples](https://tailwindui.com)
- [Headless UI for React](https://headlessui.com)
- [Tailwind CSS IntelliSense VSCode Extension](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)