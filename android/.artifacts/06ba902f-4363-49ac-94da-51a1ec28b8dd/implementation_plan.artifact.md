# Full-Stack Application Overhaul & Feature Expansion

This plan outlines the implementation of all requested enhancements across Gamification, Accessibility, Smart Analytics, and Technical Optimization.

## Proposed Changes

### 1. Gamification & Engagement Layer
*   **Daily Challenge System**:
    *   [MODIFY] [users.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/lib/db/src/schema/users.ts): Add `lastDailyChallengeAt` (already exists) and `streakCount`.
    *   [NEW] [challenge.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/api-server/src/routes/challenge.ts): Endpoint to get "Today's Special Question" and claim rewards.
*   **Virtual Shop**:
    *   [MODIFY] [progress.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/api-server/src/routes/progress.ts): Add `/shop/purchase` endpoint.
    *   [NEW] [Garage.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Garage.tsx): UI for the virtual shop.

### 2. Accessibility & Learning Depth
*   **Voice-Over Support**:
    *   [MODIFY] [Test.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Test.tsx): Integrate `expo-speech` for reading questions aloud.
*   **Multi-Language Framework**:
    *   [NEW] [i18n.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/lib/i18n.ts): Setup `i18next` for Shona and Ndebele support.

### 3. Smart Analytics Engine
*   **Weak Spot Detection**:
    *   [MODIFY] [progress.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/api-server/src/routes/progress.ts): New logic to identify specific categories/tags with >3 consecutive fails.
*   **Exam Readiness Projection**:
    *   [MODIFY] [Progress.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Progress.tsx): Add a "Predicted Pass Date" card based on recent score trends.

### 4. Technical & Mobile Optimization
*   **True Offline Mode**:
    *   [NEW] [offline-db.ts](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/lib/offline-db.ts): Robust question caching using `AsyncStorage`.
*   **Biometric Login**:
    *   [MODIFY] [Settings.tsx](file:///C:/Users/Denny/Downloads/Learner-Exam-Simulator/Learner-Exam-Simulator/artifacts/vid-master/src/pages/Settings.tsx): Add "Enable FaceID/TouchID" toggle using `expo-local-authentication`.

## Verification Plan

### Automated Tests
- Run `pnpm run typecheck` to ensure all new i18n and biometric types are correct.
- Mock API responses to test "Weak Spot" logic.

### Manual Verification
- Verify Voice-Over works on an Android device/emulator.
- Check "Daily Challenge" completion updates the streak correctly.
- Test "Airplane Mode" to verify question caching.
