import { cursorReducer } from "./cursor.reducer";

import {
   mouseDownAction,
   mouseLeaveAction,
   mouseMoveAction,
   mouseUpAction,
} from "../actions";

describe("cursorReducer", () => {
    const sut = cursorReducer;
    let actualState;
    let mockAction;
    let mockState: any;

    it("should be defined", () => {
        expect(cursorReducer).toBeDefined();
    });

    it("should return initiall state for unknown action", () => {
        mockState = { mock: "MOCK-STATE" } as any;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = cursorReducer(mockState, mockAction);

        expect(actualState).toEqual(mockState);
    });

    describe("#MOUSE_DOWN", () => {
        it("should set initial mouse coordinates", () => {
            mockState = {  } as any;

            mockAction = mouseDownAction(1, 2);
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toEqual(jasmine.objectContaining({
                mouseClick: true,
                mouseBegin: { x: 1, y: 2 },
                mouseCurrent: { x: 1, y: 2 },
            }));
        });
    });

    describe("#MOUSE_UP", () => {
        it("should ignote action if mouse is not captured", () => {
            mockState = {
                mouseClick: false,
            } as any;

            mockAction = mouseUpAction(1, 2);
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toBe(mockState);
        });
        it("should set current coordinates", () => {
            mockState = {
                mouseClick: true,
                mouseBegin: { x: 0, y: 0 },
            } as any;

            mockAction = mouseUpAction(1, 2);
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toEqual({
                mouseClick: false,
                mouseBegin: { x: 0, y: 0 },
                mouseCurrent: { x: 1, y: 2 },
            } as any);
        });
    });

    describe("#MOUSE_MOVE", () => {
        it("should skip changes if mouse not captured", () => {
            mockState = {
                mouseClick: false,
            } as any;

            mockAction = mouseMoveAction(1, 2);
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toBe(mockState);
        });

        it("should update current mouse move", () => {
            mockState = {
                mouseClick: true,
                mouseBegin: { x: 0, y: 0 },
            } as any;

            mockAction = mouseMoveAction(1, 2);
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toEqual({
                mouseClick: true,
                mouseBegin: { x: 0, y: 0 },
                mouseCurrent: { x: 1, y: 2 },
            } as any);
        });
    });

    describe("#MOUSE_LEAVE", () => {
        it("should ignore changes if mouse not captured", () => {
            mockState = {
                mouseClick: false,
            } as any;

            mockAction = mouseLeaveAction();
            actualState = cursorReducer(mockState, mockAction);
            expect(actualState).toBe(mockState);
        });

        it("should set mouse move to false", () => {
            mockState = {
                mouseClick: true,
                mouseBegin: { x: 1, y: 2 },
            } as any;
            mockAction = mouseLeaveAction();
            actualState = cursorReducer(mockState, mockAction);

            expect(actualState).toEqual(jasmine.objectContaining({
                mouseClick: false,
            }));
        });
    });
});
