
# Core Testing Philosophy
- **Test user behavior, not implementation details** - Focus on what users see and do
- **Write tests that give confidence** - Tests should verify the component works as expected
- **Keep tests maintainable** - Clear, readable tests that are easy to update

# Query Priority Guide
1. **getByRole** - Preferred for accessible elements
2. **getByLabelText** - For form controls
3. **getByPlaceholderText** - For inputs with placeholders
4. **getByText** - For visible text content
5. **getByDisplayValue** - For form values
6. **getByTestId** - Last resort only

# File Structure
- Test files are in the same folder as the file under tests (no dedicated test folders __test__)
- Test files must have suffix `.test.tsx` or `.test.ts`

# Package.json
- `npm run test` run all `.test.ts` and none of the `.test.tsx`
- `npm run test:ui` run all `.test.tsx` and none of the `.test.ts`

# Best Practices Checklist

- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Avoid testing implementation details
- ✅ Use userEvent over fireEvent
- ✅ Write descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Test edge cases and error states
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies
- ✅ Use data-testid sparingly
- ✅ Avoid snapshot testing for dynamic content

## Common Pitfalls to Avoid

- ❌ Testing component state directly
- ❌ Using container.querySelector
- ❌ Testing implementation details
- ❌ Overusing snapshot tests
- ❌ Writing brittle selectors
- ❌ Not waiting for async operations
- ❌ Testing third-party library behavior
