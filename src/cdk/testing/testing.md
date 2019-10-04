`@angular/cdk/testing` provides infrastructure to help with testing Angular components.

### Component test harnesses

A component harness is a class that lets a test interact with a component via a supported API.
Each harness's API interacts with a component the same way a user would. By using the harness API,
a test insulates itself against updates to the internals of a component, such as changing its DOM
structure. The idea for component harnesses comes from the
[PageObject](https://martinfowler.com/bliki/PageObject.html) pattern commonly used for integration
testing.

`@angular/cdk/testing` contains infrastructure for _creating_ component test harnesses. You can
create test harnesses for any component, ranging from small reusable widgets to full application
pages. 

The component harness system supports multiple testing environments. You can use the same harness
implementation in both unit and end-to-end tests. This means that users only need to learn one API,
and component authors don't have to maintain separate unit and end-to-end test implementations.

Common component libraries, in particular, benefit from this infrastrucure
due to the wide use of their components. By providing a test harnesses, the consumers of a
component can write tests that avoid dependencies on any private implentation details. By
caputring these implementation details in a single place, consumers can more easily update to new
library versions.

This document provides guidance for three types of developers:
1. [Test authors](#api-for-test-authors)
2. [Component harness authors](#api-for-component-harness-authors)
3. [Harness environment authors](#api-for-harness-environment-authors)
   
Since many users fall into only one of these categories, the relevant APIs are broken out by user
type in the sections below.

### API for test authors

Test authors are developers using component harnesses written by someone else to test their
application. For example, this could be an app developer who uses a third-party menu component
and needs to interact with the menu in a unit test.

#### `TestbedHarnessEnvironment` and `ProtractorHarnessEnvironment`

These classes correspond to different implementations of the component harness system with bindings
for specific test environments. Any given test must only import _one_ of these classes.
Karma-based unit tests should use the `TestbedHarnessEnvironment`, while Protractor-based end-to-end
tests should use the `ProtractorHarnessEnvironment`. Additonal environments require
custom bindings; see [API for harness environment authors](#api-for-harness-environment-authors))
for more information on alternate test environments.

These classes are primarily used to create a `HarnessLoader` instance, and in certain cases, to
create `ComponentHarness` instances directly.

`TestbedHarnessEnvironment` offers the following static methods:

| Method                            | Description                             |
| --------------------------------- | --------------------------------------- |
| `loader(fixture:                  | Gets a `HarnessLoader` instance for the |
: ComponentFixture<unknown>)\:      : given fixture, rooted at the fixture's  :
: HarnessLoader`                    : root element. Should be used to create  :
:                                   : harnesses for elements contained inside :
:                                   : the fixture                             :
| `documentRootLoader(fixture:      | Gets a `HarnessLoader` instance for the |
: ComponentFixture<unknown>)\:      : given fixture, rooted at the HTML       :
: HarnessLoader`                    : document's root element. Can be used to :
:                                   : create harnesses for elements that fall :
:                                   : outside of the fixture                  :
| `harnessForFixture<T extends      | Used to create a `ComponentHarness`     |
: ComponentHarness>(fixture\:       : instance for the fixture's root element :
: ComponentFixture<unknown>,        : directly. This is necessary when        :
: harnessType\:                     : bootstrapping the test with the         :
: ComponentHarnessConstructor<T>)\: : component you plan to load a harness    :
: Promise<T>`                       : for, because Angular does not set the   :
:                                   : proper tag name when creating the       :
:                                   : fixture.                                :

In most cases, it is sufficient to just create a `HarnessLoader` in the `beforeEach` clause using
`TestbedHarnessEnvironment.loader(fixture)` and then use that `HarnessLoader` to create any
necessary `ComponentHarness` instances. The other methods can be used for special cases as shown in
this example:  

Consider a reusable dialog-button component that opens a dialog on button click, made up of the
following components, each with a corresponding harness:
- `MyDialogButton` (composes the `MyButton` and `MyDialog` with a convenient API)
- `MyButton` (a simple button component)
- `MyDialog` (a dialog appended to `document.body` by `MyButtonDialog` when the button is clicked)

The following code demonstrates loading harnesses for each of these components:

```ts
it('loads harnesses', async () => {
  const fixture = TestBed.createComponent(MyDialogButton);
  // We're loading a harness for the same component we bootstrapped to create our fixture,
  // so we need to use `harnessForFixture`
  const dialogButtonHarness =
      await TestbedHarnessEnvironment.harnessForFixture(fixture, MyDialogButtonHarness);
  // The button element is inside the fixture's root element so we use `loader()`.
  const buttonHarness =
      await TestbedHarnessEnvironment.loader().getHarness(MyButtonHarness);
  // Click the button to open the dialog
  await buttonHarness.click();
  // The dialog is appended to `document.body`, outside of the fixture's root element,
  // so we use `documentRootLoader()` in this case.
  const dialogHanress
      await TestbedHarnessEnvironment.documentRootLoader().getHarness(MyDialogHarness);

  // ... make some assertions
});
```

`ProtractorHarnessEnvironment` has an API that consists of a single static method:

| Method | Description |
| ------ | ----------- |
| `loader(): HarnessLoader` | Gets a `HarnessLoader` instance for the current HTML document, rooted at the document's root element. |

Since Protractor does not deal with fixtures, the API in this environment is simpler. The
`HarnessLoader` returned by the `loader()` method should be sufficient for loading all necessary
`ComponentHarness` instances.

#### `HarnessLoader`

Instances of this class correspond to a specific element (referred to as the "root element" of the
`HarnessLoader`) in the DOM and are used to create `ComponentHarness` instances for elements under
its root element.

`HarnessLoader` instances have the following methods:

| Method | Description |
| ------ | ----------- |
| `getChildLoader(selector: string): Promise<HarnessLoader>` | Searches for an element matching the given selector below the root element of this `HarnessLoader`, and returns a new `HarnessLoader` rooted at the first matching element |
| `getAllChildLoaders(selector: string): Promise<HarnessLoader[]>` | Acts like `getChildLoader`, but returns a list of new `HarnessLoader`, one for each matching element, rather than just the first matching element |
| `getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T>` | Searches for an instance of the given `ComponentHarness` class or `HarnessPredicate` below the root element of this `HarnessLoader` and returns an instance of the harness corresponding to the first matching element |
| `getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T[]>` | Acts like `getHarness`, but returns a list of harness instances, one for each matching element, rather than just the first matching element  |

Calls to `getHarness` and `getAllHarnesses` can either take `ComponentHarness` subclass or a 
`HarnessPredicate`. `HarnessPredicate` applies additional restrictions to the search (e.g. searching
for a button that has some particular text, etc). The
[details of `HarnessPredicate`](#harnesspredicate) are discussed in the
[API for component harness authors](#api-for-component-harness-authors), as it is intended that
harness authors will provide convenience methods on their `ComponentHarness` subclass to facilitate
creation of `HarnessPredicate` instances. However, if the harness author's API is not sufficient,
they can be created manually.

#### `ComponentHarness`

This is the abstract base class for all component harnesses. All `ComponentHarness` subclasses have
a static property `hostSelector` that is used to match the harness class to instances of the
component in the DOM. Beyond that, the API of any particular harness is completely up to the harness
author, and it is therefore best to refer to the author's documentation.

#### Working with asynchronous component harness methods

In order to support both unit and end-to-end tests, and to insulate tests against changes in
asynchronous behavior, almost all harness methods are asynchronous and return a `Promise`;
therefore, it is strongly recommended to use the 
[ES2017 `async`/`await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
to improve the readability of tests.

It is important to remember that `await` statements block the execution of your test until the
associated `Promise` resolves. When reading multiple properties off a harness it may not be
necessary to block on the first before asking for the next, in these cases  use `Promise.all` to
parallelize.

For example, consider the following example of reading both the `checked` and `indeterminate` state
off of a checkbox harness:

```ts
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  const [checked, indeterminate] = await Promise.all([
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate()
  ]);

  // ... make some assertions
});
```

### API for component harness authors

TODO(mmalerba): Fill in docs for harness authors

#### `HarnessPredicate`

TODO(mmalerba): Fill in docs for `HarnessPredicate`

### API for harness environment authors

TODO(mmalerba): Fill in docs for harness environment authors
