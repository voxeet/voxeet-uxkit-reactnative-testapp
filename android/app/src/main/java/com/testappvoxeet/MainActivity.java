package com.testappvoxeet;

import com.voxeet.specifics.RNVoxeetActivity

public class MainActivity extends RNVoxeetActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "testappvoxeet";
  }
}
