### Guide Content Rendering Requirements

#### 1. Typography
- All guide content MUST be rendered in monospace font
- Font family should prioritize readability (e.g., `Consolas`, `Monaco`, `Courier New`)
- Font size should be adjustable for accessibility

#### 2. Container Width
- Content container should adjust width to fit the viewport
- Maintain consistent character width ratios
- Responsive design that preserves formatting on different screen sizes

#### 3. Text Wrapping
- **NO word-wrapping** 
- preserve original line breaks
- Avoid Horizontal scrolling when possible
- Preserve exact spacing and alignment from source content

#### 4. Content Preservation
- ASCII art, tables, and diagrams must maintain their original structure
- Column alignment must be preserved
- Special characters and box-drawing characters must render correctly

### Implementation Guidelines

```css
/* Example CSS Implementation */
.guide-content {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  white-space: pre;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
}

.guide-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: auto;
}
```

### Supported Content Types
1. **ASCII Tables**: Must maintain column alignment
   ```
   +--------+--------+--------+
   | Item   | Value  | Status |
   +--------+--------+--------+
   | Health | 100/100| OK     |
   +--------+--------+--------+
   ```

2. **ASCII Art**: Must preserve character positioning
   ```
     /\_/\
    ( o.o )
     > ^ <
   ```

3. **Game Maps**: Must maintain spatial relationships
   ```
   ##############################
   #.....#.........#...........#
   #..$..#...###...#...###.....#
   #.....#...#.#...#...#.#.....#
   ##############################
   ```

### Best Practices
1. Test with various ASCII-based content types
2. Ensure content is readable on mobile devices with horizontal scroll
3. Preserve all spacing, including multiple consecutive spaces
4. Consider adding zoom controls for better readability
5. Test with different monospace fonts for optimal rendering
