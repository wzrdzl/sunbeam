import React from 'react';
import expect from 'expect';
import { createRenderer } from 'react-addons-test-utils';
import { getMountedInstance } from 'react-shallow-testutils';
import { findFocusableNode, getFocusableData } from './utils/FocusableTreeUtils';
import FocusManager from './FocusManager';

// ================== test harnesses ==========================

class TestFocusable extends React.Component {
  constructor() {
    super();
    this._focusable = {};
  }

  render() {
    return null;
  }
}

function createInstanceOfComponent(ComponentClass, props) {
  const renderer = createRenderer();
  renderer.render(<ComponentClass {...props} />);

  return getMountedInstance(renderer);
}

// =============================================================

describe('FocusManager', () => {

  // property? current focus target

  describe('API', () => {

    afterEach(() => {
      // clear the focusTree
      FocusManager._focusTree.root = null;
    });

    describe('initializeFocus', () => {
      it('should have "initializeFocus" method', () => {
        expect(FocusManager.initializeFocus).toExist();
      });
    });

    describe('registerFocusable', () => {

      it('should place component in the root of the _focusTree if tree is empty', () => {
        const testComponentInstance = createInstanceOfComponent(TestFocusable);

        FocusManager.registerFocusable(testComponentInstance);

        expect(FocusManager._focusTree.root).toBe(testComponentInstance);
      });

      it('should register component as a child of the container with "focusableId" equal to provided "parentFocusableId"', () => {
        const parentComponentInstance = createInstanceOfComponent(TestFocusable);
        const childComponentInstance = createInstanceOfComponent(TestFocusable);
        const parentFocusableId = 'some id';

        parentComponentInstance._focusable.focusableId = parentFocusableId;

        FocusManager.registerFocusable(parentComponentInstance);
        FocusManager.registerFocusable(childComponentInstance, parentFocusableId);

        expect(parentComponentInstance._focusable.children[0]).toBe(childComponentInstance);
        expect(childComponentInstance._focusable.parent).toBe(parentComponentInstance);
      });

      it('should throw if there is no component with "focusableId" equal to provided "parentFocusableId" in the tree', () => {
        const parentComponentInstance = createInstanceOfComponent(TestFocusable);
        const childComponentInstance = createInstanceOfComponent(TestFocusable);
        const parentFocusableId = 'some id';
        const wrongParentFocusableId = parentFocusableId + 'lets break it';

        parentComponentInstance._focusable.focusableId = parentFocusableId;

        FocusManager.registerFocusable(parentComponentInstance);
        expect(() => FocusManager.registerFocusable(childComponentInstance, wrongParentFocusableId))
            .toThrow(/there is no focusableContainer with focusableId:/);
      });

      it("should throw if root isn't vacant and there is no 'parentFocusableId' provided", () => {
        const parentComponentInstance = createInstanceOfComponent(TestFocusable);
        const childComponentInstance = createInstanceOfComponent(TestFocusable);

        FocusManager.registerFocusable(parentComponentInstance);

        expect(() => FocusManager.registerFocusable(childComponentInstance))
            .toThrow(/"parentFocusableId" is not provided, but root component in the tree is already defined/);
      });

    });

    describe('deregisterFocusable', () => {

      let parentComponentInstance, childComponentInstance, grandChildComponentInstance;

      beforeEach(() => {
        const focusTree = FocusManager._focusTree;
        parentComponentInstance = createInstanceOfComponent(TestFocusable);
        childComponentInstance = createInstanceOfComponent(TestFocusable);
        grandChildComponentInstance = createInstanceOfComponent(TestFocusable);

        // manually build focusTree
        getFocusableData(grandChildComponentInstance).focusableId = 'randomGrandChild';
        getFocusableData(grandChildComponentInstance).parent = childComponentInstance;
        getFocusableData(childComponentInstance).focusableId = 'randomChild';
        getFocusableData(childComponentInstance).parent = parentComponentInstance;
        getFocusableData(childComponentInstance).children = [ grandChildComponentInstance ];
        getFocusableData(parentComponentInstance).focusableId = 'randomParent';
        getFocusableData(parentComponentInstance).children = [ childComponentInstance ];

        focusTree.root = parentComponentInstance;
      });

      it('should remove focusable from the _focusTree if it is there, links to parent and children should be nullified', () => {
        // check if childComponentInstance is really in the tree and tree has correct structure
        const foundFocusable = findFocusableNode(
            FocusManager._focusTree.root,
            (focusable) => focusable === childComponentInstance
        );
        expect(foundFocusable).toBe(childComponentInstance);

        FocusManager.deregisterFocusable(childComponentInstance);

        // there shouldn't be childComponentInstance in the tree anymore
        const result = findFocusableNode(
            FocusManager._focusTree.root,
            (focusable) => focusable === childComponentInstance
        );
        expect(result).toNotExist();
        expect(getFocusableData(childComponentInstance).parent).toNotExist();
        expect(getFocusableData(childComponentInstance).children).toNotExist();
      });

    });

    it('should have "doUp" method', () => {
      expect(FocusManager.doUp).toExist();
    });

    it('should have "doRight" method', () => {
      expect(FocusManager.doRight).toExist();
    });

    it('should have "doDown" method', () => {
      expect(FocusManager.doDown).toExist();
    });

    it('should have "doLeft" method', () => {
      expect(FocusManager.doLeft).toExist();
    });

    it('should have "doSelect" method', () => {
      expect(FocusManager.doSelect).toExist();
    });
  });

});
