import { SurveyModel, ILocalizableOwner, LocalizableString, Serializer, JsonObjectProperty, QuestionMatrixDynamicModel, RegexValidator, IAnimationGroupConsumer, PageModel, settings as surveySettings } from "survey-core";
import { editorLocalization } from "../../src/editorLocalization";
import { StringEditorViewModelBase } from "../../src/components/string-editor";
import { CreatorTester } from "../creator-tester";
import { TabDesignerPlugin } from "../../src/components/tabs/designer-plugin";
import { LogoImageViewModel } from "../../src/components/header/logo-image";
import { SurveyLogicUI } from "../../src/components/tabs/logic-ui";
import { PageAdorner } from "../../src/components/page";
import { QuestionAdornerViewModel } from "../../src/components/question";
import { TabDesignerViewModel } from "../../src/components/tabs/designer";
export * from "../../src/property-grid/matrices";

test("Survey/page title/description placeholders text", () => {
  new CreatorTester();
  const survey: SurveyModel = new SurveyModel({
    pages: [
      {
        elements: [
          { type: "text" }
        ]
      }
    ]
  });
  const checkPlaceholder = (owner: ILocalizableOwner, ownerName: string, propertyName: string, placeholderText?: string) => {
    const locStr: LocalizableString = new LocalizableString(owner, false, propertyName);
    const editor: StringEditorViewModelBase = new StringEditorViewModelBase(locStr, null);
    const property: JsonObjectProperty = Serializer.findProperty(ownerName, propertyName);
    const placeholder: string = placeholderText || editorLocalization.getString((<any>property).placeholder);
    expect(editor.placeholder).toEqual(placeholder);
  };
  checkPlaceholder(survey, "survey", "title");
  checkPlaceholder(survey, "survey", "description");
  checkPlaceholder(survey.pages[0], "page", "title", "Page 1");
  checkPlaceholder(survey.pages[0], "page", "description");
});

test("Save survey action properties", () => {
  const creator = new CreatorTester();
  const action = creator.getActionBarItem("svd-save");
  expect(action.visible).toBeFalsy();
  expect(action.active).toBeFalsy();
  expect(action.enabled).toBeFalsy();

  creator.saveSurveyFunc = () => { };
  expect(action.visible).toBeTruthy();
  expect(action.active).toBeFalsy();
  expect(action.enabled).toBeFalsy();

  creator.activeTab = "test";
  expect(action.visible).toBeFalsy();
  expect(action.active).toBeFalsy();
  expect(action.enabled).toBeFalsy();

  creator.activeTab = "designer";
  expect(action.visible).toBeTruthy();
  expect(action.active).toBeFalsy();
  expect(action.enabled).toBeFalsy();

  creator.setModified({});
  expect(action.visible).toBeTruthy();
  expect(action.active).toBeTruthy();
  expect(action.enabled).toBeTruthy();
});

test("StringEditorViewModelBase maxLength", () => {
  let survey: SurveyModel = new SurveyModel({});
  let editor: StringEditorViewModelBase = new StringEditorViewModelBase(survey.locTitle, null);
  expect(editor.maxLength).toBe(-1);
  try {
    Serializer.findProperty("survey", "title").maxLength = 4;
    survey = new SurveyModel({});
    editor = new StringEditorViewModelBase(survey.locTitle, null);
    expect(editor.maxLength).toBe(4);
  }
  finally {
    Serializer.findProperty("survey", "title").maxLength = -1;
  }
});

test("Designer widthMode css test", () => {
  const creator = new CreatorTester();
  var designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );
  creator.JSON = { elements: [{ name: "question1", type: "text" }, { name: "question2", type: "text" }, { name: "question3", type: "text" }, { name: "question4", type: "text" }] };
  expect(designerPlugin.model.designerCss).toEqual("sd-container-modern sd-container-modern--static");
  creator.survey.getQuestionByName("question2").startWithNewLine = false;
  expect(designerPlugin.model.designerCss).toEqual("sd-container-modern sd-container-modern--responsive");

  creator.survey.widthMode = "static";
  expect(designerPlugin.model.designerCss).toEqual("sd-container-modern sd-container-modern--static");
  creator.survey.widthMode = "responsive";
  expect(designerPlugin.model.designerCss).toEqual("sd-container-modern sd-container-modern--responsive");
});

test("Select survey in designer", () => {
  const creator = new CreatorTester();
  var designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );
  creator.JSON = { elements: [{ name: "question1", type: "text" }] };

  creator.selectElement(creator.survey.getAllQuestions()[0]);
  expect(creator.selectedElementName).toEqual("question1");
  designerPlugin.model.clickDesigner();
  expect(creator.selectedElementName).toEqual("survey");
});

test("StringEditorViewModelBase page title placeholder", () => {
  Serializer.findProperty("page", "title")["placeholder"] = "pe.pageTitlePlaceholder";
  let survey: SurveyModel = new SurveyModel({
    pages: [
      {
        elements: [
          { type: "text" }
        ]
      }
    ]
  });
  let page1 = survey.pages[0];
  let editor: StringEditorViewModelBase = new StringEditorViewModelBase(page1.locTitle, null);
  expect(page1.visibleIndex).toBe(0);
  expect(page1.num).toBe(1);
  expect(editor.placeholderValue).toBeUndefined();
  expect(editor.placeholder).toBe("Page 1");
  expect(editor.placeholderValue).toBe("Page 1");
});

test("Logo css", () => {
  const creator = new CreatorTester();
  var logo = new LogoImageViewModel(creator, null);
  expect(logo.allowEdit).toBe(true);
  expect(logo.containerCss).toBe("svc-logo-image-container svc-logo-image-container--editable");
  creator.readOnly = true;
  expect(logo.allowEdit).toBe(false);
  expect(logo.containerCss).toBe("svc-logo-image-container");
});

test("Logo should be unclickable in readonly mode", () => {
  const creator = new CreatorTester();
  var logo = new LogoImageViewModel(creator, null);
  creator.readOnly = true;
  logo.chooseFile(logo);
});

test("StringEditorViewModelBase skip undo/redo hot keys", () => {
  let survey: SurveyModel = new SurveyModel({
    pages: [
      {
        elements: [
          { type: "text" }
        ]
      }
    ]
  });
  let page1 = survey.pages[0];
  let editor: StringEditorViewModelBase = new StringEditorViewModelBase(page1.locTitle, null);
  let result = "";
  const event = {
    keyCode: 70,
    ctrlKey: true,
    stopImmediatePropagation: () => result += "->ip",
    preventDefault: () => result += "->pd"
  };
  expect(result).toBe("");
  editor.checkConstraints(event);
  expect(result).toBe("");
  event.keyCode = 89;
  editor.checkConstraints(event);
  expect(result).toBe("->ip->pd");
  event.keyCode = 90;
  editor.checkConstraints(event);
  expect(result).toBe("->ip->pd->ip->pd");
});

test("StringEditorViewModelBase skip formatting keys and enter key", () => {
  let survey: SurveyModel = new SurveyModel({
    pages: [
      {
        elements: [
          { type: "text" }
        ]
      }
    ]
  });

  let editor: StringEditorViewModelBase = new StringEditorViewModelBase(survey.locTitle, null);
  let result = "";
  const event = {
    keyCode: 70,
    ctrlKey: true,
    stopImmediatePropagation: () => result += "->ip",
    preventDefault: () => result += "->pd"
  };
  expect(result).toBe("");
  editor.checkConstraints(event);
  expect(result).toBe("");
  event.keyCode = 66;
  editor.checkConstraints(event);
  expect(result).toBe("->ip->pd");
  event.keyCode = 73;
  editor.checkConstraints(event);
  expect(result).toBe("->ip->pd->ip->pd");

  result = "";
  const eventMac = {
    keyCode: 70,
    metaKey: true,
    stopImmediatePropagation: () => result += "->ip",
    preventDefault: () => result += "->pd"
  };
  expect(result).toBe("");
  editor.checkConstraints(eventMac);
  expect(result).toBe("");
  eventMac.keyCode = 66;
  editor.checkConstraints(eventMac);
  expect(result).toBe("->ip->pd");
  eventMac.keyCode = 73;
  editor.checkConstraints(eventMac);
  expect(result).toBe("->ip->pd->ip->pd");

  result = "";
  const eventEnter = {
    keyCode: 13,
    stopImmediatePropagation: () => result += "->ip",
    preventDefault: () => result += "->pd"
  };
  expect(result).toBe("");
  editor.checkConstraints(eventEnter);
  expect(result).toBe("->pd");

  let editor2: StringEditorViewModelBase = new StringEditorViewModelBase(survey.locDescription, null);
  result = "";
  expect(result).toBe("");
  editor2.checkConstraints(eventEnter);
  expect(result).toBe("");
});

test("Property Grid and logic tab, Bug#4877", () => {
  const creator = new CreatorTester({ showLogicTab: true });
  creator.selectElement(creator.survey);
  const logicPanel = creator.propertyGrid.getPanelByName("logic");
  logicPanel.expand();
  const triggersQuestion = <QuestionMatrixDynamicModel>logicPanel.getQuestionByName("triggers");
  expect(triggersQuestion.visibleRows).toHaveLength(0);
  const logic = new SurveyLogicUI(creator.survey);
  logic.addNew();
  const expressionEditor = logic.expressionEditor;
  const itemEditor = logic.itemEditor;
  const actionPanel = itemEditor.panels[0];
  const logicTypeName = actionPanel.getQuestionByName("logicTypeName");
  logicTypeName.value = "trigger_complete";
  expressionEditor.text = "{var1} = 1";
  logic.itemEditor.apply();
  expect(triggersQuestion.visibleRows).toHaveLength(1);
});
test("Property Grid and adding a validator in the code, Bug#4882", () => {
  const creator = new CreatorTester({ showLogicTab: true });
  creator.JSON = { elements: [{ type: "text", name: "q1" }] };
  const q1 = creator.survey.getQuestionByName("q1");
  creator.selectElement(q1);
  const validatorPanel = creator.propertyGrid.getPanelByName("validation");
  validatorPanel.expand();
  const validatorsQuestion = <QuestionMatrixDynamicModel>validatorPanel.getQuestionByName("validators");
  expect(validatorsQuestion.visibleRows).toHaveLength(0);
  q1.validators.push(new RegexValidator(""));
  expect(validatorsQuestion.visibleRows).toHaveLength(1);
});
test("overridingProperty affects LogoImageViewModel allowEdit", () => {
  Serializer.addProperty("survey", {
    name: "logoToggle:boolean",
    category: "logo",
    visibleIndex: 0
  });
  Serializer.findProperty("survey", "logo").overridingProperty = "logoToggle";
  const creator = new CreatorTester();
  creator.JSON = { elements: [{ type: "text", name: "q1" }] };
  const logoEditor = new LogoImageViewModel(creator, null as any);

  expect(creator.survey["logoToggle"]).toBeFalsy();
  expect(logoEditor.allowEdit).toBeTruthy();

  creator.survey["logoToggle"] = true;
  expect(logoEditor.allowEdit).toBeFalsy();

  Serializer.findProperty("survey", "logo").overridingProperty = "";

  expect(creator.survey["logoToggle"]).toBeTruthy();
  expect(logoEditor.allowEdit).toBeTruthy();

  creator.readOnly = true;
  expect(logoEditor.allowEdit).toBeFalsy();

  Serializer.removeProperty("survey", "logoToggle");
});

test("expand all and collapse all", () => {

  const creator = new CreatorTester();
  creator.expandCollapseButtonVisibility = "onhover";
  creator.JSON = {
    "pages": [
      {
        "name": "page1",
        "elements": [
          {
            "type": "text",
            "name": "question1"
          }
        ]
      },
      {
        "name": "page2",
        "elements": [
          {
            "type": "panel",
            "name": "panel1"
          }
        ]
      }
    ]
  };
  var designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );

  const page1Adorner = new PageAdorner(creator, creator.survey.pages[0]);
  const page2Adorner = new PageAdorner(creator, creator.survey.pages[1]);
  const questionAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllQuestions()[0], undefined);
  const panelAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllPanels()[0] as any, undefined);
  expect(page1Adorner.collapsed).toBeFalsy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeFalsy();
  expect(panelAdorner.collapsed).toBeFalsy();

  designerPlugin.model.surfaceToolbar.actions[0].action(designerPlugin.model.surfaceToolbar.actions[0]);
  expect(page1Adorner.collapsed).toBeTruthy();
  expect(page2Adorner.collapsed).toBeTruthy();
  expect(questionAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeTruthy();

  designerPlugin.model.surfaceToolbar.actions[1].action(designerPlugin.model.surfaceToolbar.actions[1]);
  expect(page1Adorner.collapsed).toBeFalsy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeFalsy();
  expect(panelAdorner.collapsed).toBeFalsy();
});

test("check pages animation", () => {
  const creator = new CreatorTester();
  creator.expandCollapseButtonVisibility = "onhover";
  creator.JSON = {
    "pages": [
      {
        "name": "page1",
        title: "Test page",
        "elements": [
          {
            "type": "text",
            "name": "question1"
          }
        ]
      },
      {
        "name": "page2",
        "elements": [
          {
            "type": "panel",
            "name": "panel1"
          }
        ]
      }
    ]
  };

  const designer = new TabDesignerViewModel(creator);
  const [p1, p2] = creator.survey.pages;
  const page1Adorner = new PageAdorner(creator, p1);
  const container = document.createElement("div");
  const parentContainer = document.createElement("div");
  parentContainer.appendChild(container);
  page1Adorner.rootElement = container;
  const animationOptions = designer["getPagesAnimationOptions"]() as Required<IAnimationGroupConsumer<PageModel>>;

  expect(animationOptions.getAnimatedElement(p1)).toBe(parentContainer);

  const enterOptions = animationOptions.getEnterOptions(p1);
  expect(enterOptions.cssClass).toBe("svc-page--enter");
  enterOptions.onBeforeRunAnimation && enterOptions.onBeforeRunAnimation(parentContainer);
  expect(parentContainer.style.getPropertyValue("--animation-height-from")).toBe("0px");
  enterOptions.onAfterRunAnimation && enterOptions.onAfterRunAnimation(parentContainer);
  expect(parentContainer.style.getPropertyValue("--animation-height-from")).toBe("");

  const leaveOptions = animationOptions.getLeaveOptions(p1);
  expect(leaveOptions.cssClass).toBe("svc-page--leave");
  leaveOptions.onBeforeRunAnimation && leaveOptions.onBeforeRunAnimation(parentContainer);
  expect(parentContainer.style.getPropertyValue("--animation-height-from")).toBe("0px");
  leaveOptions.onAfterRunAnimation && leaveOptions.onAfterRunAnimation(parentContainer);
  expect(parentContainer.style.getPropertyValue("--animation-height-from")).toBe("");

  p1["draggedFrom"] = 0;
  let options = { deletedItems: [], reorderedItems: [{ item: p1, movedForward: true }, { item: p2, movedForward: false }], addedItems: [], mergedItems: [p2, p1] };
  animationOptions.onCompareArrays(options);
  expect(options.reorderedItems).toEqual([]);
  expect(options.addedItems).toEqual([p1]);
  expect(options.deletedItems.length).toEqual(1);
  let ghostPage = options.deletedItems[0] as PageModel;
  expect(ghostPage["isGhost"]).toEqual(true);
  expect(ghostPage !== p1).toBeTruthy();
  expect(ghostPage.title).toBe("Test page");
  expect(ghostPage.num).toBe(1);
  expect(options.mergedItems).toEqual([ghostPage, p2, p1]);

  p1["draggedFrom"] = 2;
  options = { deletedItems: [], reorderedItems: [{ item: p1, movedForward: false }, { item: p2, movedForward: true }], addedItems: [], mergedItems: [p1, p2] };
  animationOptions.onCompareArrays(options);
  expect(options.reorderedItems).toEqual([]);
  expect(options.addedItems).toEqual([p1]);
  expect(options.deletedItems.length).toEqual(1);
  ghostPage = options.deletedItems[0] as PageModel;
  expect(ghostPage["isGhost"]).toEqual(true);
  expect(ghostPage).not.toBe(p1);
  expect(ghostPage.title).toBe("Test page");
  expect(ghostPage.num).toBe(1);
  expect(options.mergedItems).toEqual([p1, p2, ghostPage]);

  p1["draggedFrom"] = undefined;
  options = { deletedItems: [], reorderedItems: [], addedItems: [], mergedItems: [p1, p2] };
  animationOptions.onCompareArrays(options);
  expect(options.reorderedItems).toEqual([]);
  expect(options.addedItems).toEqual([]);
  expect(options.deletedItems).toEqual([]);
  expect(options.mergedItems).toEqual([p1, p2]);
});
test("expand/collapse event - loading", () => {
  surveySettings.animationEnabled = false;
  const creator = new CreatorTester();
  creator.expandCollapseButtonVisibility = "onhover";

  var designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );

  creator.onElementGetExpandCollapseState.add((_, o) => {
    if (o.reason == "loading") {
      if (o.element.name == "page2") o.collapsed = false;
      if (o.element.name == "question1") o.collapsed = true;
    }
    if (o.reason == "collapse-all") {
      if (o.element.name == "page2") o.collapsed = true;
      if (o.element.name == "question1") o.collapsed = false;
    }
    if (o.reason == "expand-all") {
      if (o.element.name == "page1") o.collapsed = false;
      if (o.element.name == "page2") o.collapsed = false;
      if (o.element.name == "question1") o.collapsed = true;
    }
    if (o.reason == "drag-start") {
      if (o.element.name == "page1") o.collapsed = true;
      if (o.element.name == "page2") o.collapsed = false;
      if (o.element.name == "panel1") o.collapsed = true;
    }
    if (o.reason == "drag-end") {
      if (o.element.name == "page1") o.collapsed = false;
      if (o.element.name == "page2") o.collapsed = false;
      if (o.element.name == "panel1") o.collapsed = true;
    }
  });

  creator.JSON = {
    "pages": [
      {
        "name": "page1",
        "elements": [
          {
            "type": "text",
            "name": "question1"
          }
        ]
      },
      {
        "name": "page2",
        "elements": [
          {
            "type": "panel",
            "name": "panel1"
          }
        ]
      }
    ]
  };

  const page1Adorner = new PageAdorner(creator, creator.survey.pages[0]);
  const page2Adorner = new PageAdorner(creator, creator.survey.pages[1]);
  const questionAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllQuestions()[0], undefined);
  const panelAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllPanels()[0] as any, undefined);

  expect(page1Adorner.collapsed).toBeFalsy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeFalsy();

  const collapseAll = designerPlugin.model.surfaceToolbar.getActionById("collapseAll");
  collapseAll.action(collapseAll);

  expect(page1Adorner.collapsed).toBeTruthy();
  expect(page2Adorner.collapsed).toBeTruthy();
  expect(questionAdorner.collapsed).toBeFalsy();
  expect(panelAdorner.collapsed).toBeTruthy();

  const expandAll = designerPlugin.model.surfaceToolbar.getActionById("expandAll");
  expandAll.action(expandAll);

  expect(page1Adorner.collapsed).toBeFalsy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeFalsy();

  creator.collapseAllPagesOnDragStart();
  expect(page1Adorner.collapsed).toBeTruthy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeFalsy();

  creator.restoreElementsState();
  expect(page1Adorner.collapsed).toBeFalsy();
  expect(page2Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeFalsy();
});

test("Check adorners lock questions for expand/collapse all", (): any => {
  surveySettings.animationEnabled = false;
  const creator = new CreatorTester();
  creator.expandCollapseButtonVisibility = "onhover";
  const designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );
  let newPageAdorner = new PageAdorner(creator, designerPlugin.model.newPage);
  newPageAdorner.addNewQuestion(newPageAdorner, null);

  let question1 = creator.survey.getQuestionByName("question1");
  let questionAdorner = new QuestionAdornerViewModel(
    creator,
    question1,
    <any>undefined
  );

  let page1 = creator.survey.pages[0];
  let pageAdorner = new PageAdorner(creator, page1);

  const collapseAll = designerPlugin.model.surfaceToolbar.getActionById("collapseAll");
  const expandAll = designerPlugin.model.surfaceToolbar.getActionById("expandAll");
  const lockQuestions = designerPlugin.model.surfaceToolbar.getActionById("lockQuestions");

  expect(pageAdorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeFalsy();

  collapseAll.action(collapseAll);

  expect(pageAdorner.collapsed).toBeTruthy();
  expect(questionAdorner.collapsed).toBeTruthy();

  lockQuestions.action(lockQuestions);
  expandAll.action(expandAll);
  expect(pageAdorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeTruthy();

  questionAdorner.collapsed = false;
  collapseAll.action(collapseAll);
  expect(pageAdorner.collapsed).toBeTruthy();
  expect(questionAdorner.collapsed).toBeFalsy();

  questionAdorner.collapsed = true;
  lockQuestions.action(lockQuestions);
  expandAll.action(expandAll);
  expect(pageAdorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeFalsy();
});

test("expand/collapse event and expand all", () => {
  surveySettings.animationEnabled = false;
  const creator = new CreatorTester();
  creator.expandCollapseButtonVisibility = "onhover";
  var designerPlugin = <TabDesignerPlugin>(
    creator.getPlugin("designer")
  );

  creator.onElementGetExpandCollapseState.add((_, o) => {
    if (o.reason == "loading") {
      o.collapsed = true;
    }
  });

  creator.JSON = {
    "pages": [
      {
        "name": "page1",
        "elements": [
          {
            "type": "panel",
            "name": "panel1",
            "elements": [
              {
                "type": "text",
                "name": "question1"
              }
            ]
          }
        ]
      }
    ]
  };

  const page1Adorner = new PageAdorner(creator, creator.survey.pages[0]);
  const panelAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllPanels()[0] as any, undefined);

  expect(page1Adorner.collapsed).toBeTruthy();
  expect(panelAdorner.collapsed).toBeTruthy();
  expect(panelAdorner.needToRenderContent).toBeFalsy();
  const expandAll = designerPlugin.model.surfaceToolbar.getActionById("expandAll");
  expandAll.action(expandAll);

  expect(panelAdorner.needToRenderContent).toBeTruthy();
  const questionAdorner = new QuestionAdornerViewModel(creator, creator.survey.getAllQuestions()[0], undefined);

  expect(page1Adorner.collapsed).toBeFalsy();
  expect(questionAdorner.collapsed).toBeFalsy();
  expect(panelAdorner.collapsed).toBeFalsy();
});
