# RTL/LTR Layout Auto-Fix Prompt Template

## General RTL Layout Issue Detection & Resolution

When encountering RTL (Right-to-Left) layout issues in bilingual applications, automatically apply these comprehensive fixes:

### 1. **Navigation & Directional Elements**
- **Arrows & Icons**: Use conditional rendering for directional icons
  - RTL: ArrowRight for back buttons, ArrowLeft for forward
  - LTR: ArrowLeft for back buttons, ArrowRight for forward
- **Icon Position**: Always maintain icon-before-text order regardless of direction
- **Flex Direction**: Apply `flex-row-reverse` for RTL layouts when needed

### 2. **Form Controls & Inputs**
- **Search Bars**: 
  - RTL: Icon on right (`right-3`), padding right (`pr-10`), text alignment right
  - LTR: Icon on left (`left-3`), padding left (`pl-10`), text alignment left
- **Dropdowns & Selects**:
  - Add `dir={isRTL ? 'rtl' : 'ltr'}` attribute
  - Apply text alignment classes: `text-right` for RTL, `text-left` for LTR
  - Content alignment: `SelectContent` and `SelectItem` need directional classes

### 3. **Layout Positioning**
- **Container Flex**: Use `flex-row-reverse` conditionally for RTL
- **Element Order**: Reverse element positioning in RTL without changing semantic order
- **Spacing & Alignment**: Apply appropriate margin/padding based on direction

### 4. **Table & Data Display**
- **Column Order**: Reverse visual column order for RTL while maintaining data integrity
- **Text Alignment**: All table cells need directional text alignment
- **Action Buttons**: Position action columns appropriately (right in RTL, left in LTR)

### 5. **Auto-Implementation Pattern**

```jsx
// Standard RTL-aware component pattern
function ComponentName() {
  const { isRTL } = useLanguage();
  
  return (
    <div className={`base-classes ${isRTL ? 'rtl-specific-classes' : 'ltr-specific-classes'}`} 
         dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Conditional Icon Rendering */}
      {isRTL ? <RightIcon /> : <LeftIcon />}
      
      {/* Conditional Layout Classes */}
      <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Content */}
      </div>
      
      {/* Input with directional support */}
      <Input 
        className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      
      {/* Select with RTL support */}
      <Select>
        <SelectTrigger className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
          <SelectItem className={isRTL ? 'text-right' : 'text-left'}>Item</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 6. **Common RTL Issues Checklist**
- [ ] Icons pointing wrong direction
- [ ] Text alignment mismatched
- [ ] Input field icons positioned incorrectly
- [ ] Dropdown content not aligned
- [ ] Flex layouts not reversed
- [ ] Missing `dir` attribute on inputs/selects
- [ ] Table columns in wrong visual order
- [ ] Button/action positioning incorrect

### 7. **Automatic Fix Strategy**
When RTL layout issues are reported:

1. **Identify Components**: Scan for navigation, forms, tables, and interactive elements
2. **Apply Conditional Classes**: Add RTL-aware styling to all identified components
3. **Icon Direction**: Replace static directional icons with conditional rendering
4. **Input Enhancement**: Add directional attributes and proper padding/alignment
5. **Layout Reversal**: Apply flex-row-reverse where visual order matters
6. **Validation**: Ensure semantic order remains unchanged while visual order adapts

### 8. **Testing Scenarios**
- Switch between RTL/LTR languages
- Verify icon directions match text flow
- Check form field alignment and icon positioning
- Validate dropdown content alignment
- Ensure table column visual order is appropriate
- Test navigation flow feels natural in both directions

This template enables automatic detection and resolution of RTL layout issues without requiring detailed user explanation of each specific problem.