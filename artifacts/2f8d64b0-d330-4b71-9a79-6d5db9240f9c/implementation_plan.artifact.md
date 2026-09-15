# Roadify UI/UX & Motion Upgrade Plan

This plan outlines the steps to upgrade Roadify's animations, transitions, and navigation to create a modern, premium experience.

## User Review Required

> [!NOTE]
> The upgrades focus on motion and interaction design. No core functionality or branding will be changed.

## Proposed Changes

### 1. Centralized Motion System Refinement
- Update [motion.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/lib/motion.ts) with premium spring constants and standardized variants.
- Add direction-aware slide animations for navigation.
- Define staggered list animations.

### 2. Navigation & Layout Polish
- [MODIFY] [AppLayout.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/layout/AppLayout.tsx)
    - Transition sidebar and bottom nav indicators using `layoutId` for a "shared element" feel.
    - Use `framer-motion` for sidebar opening/closing on mobile.
    - Add subtle hover animations to nav items.
- [MODIFY] [App.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/App.tsx)
    - Refine `PageWrapper` transitions for a smoother flow.

### 3. Component Micro-interactions
- [MODIFY] [button.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/ui/button.tsx)
    - Enhance `whileTap` and `whileHover` feedback.
- [MODIFY] [card.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/ui/card.tsx)
    - Add optional `interactive` mode with elevation and scale transitions.
- [MODIFY] [tabs.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/ui/tabs.tsx)
    - Smoothly animate the active tab indicator.

### 4. Feedback & Loading States
- [MODIFY] [skeleton.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/ui/skeleton.tsx)
    - Update shimmer effect to be more subtle and premium.
- [MODIFY] [toast.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/components/ui/toast.tsx)
    - Polish entrance/exit animations.

### 5. Page-Specific Enhancements
- Add staggered entrance animations to cards on [Dashboard.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Dashboard.tsx) and [Progress.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Progress.tsx).

## Verification Plan

### Automated Tests
- Build check: `pnpm build`
- Lint check: `pnpm typecheck`

### Manual Verification
- Verify navigation smoothness on mobile and desktop.
- Check button feedback and card hover states.
- Ensure page transitions don't cause layout jumping.
- Test `prefers-reduced-motion` compatibility.
