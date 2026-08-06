import { Theme } from "@astryxdesign/core/theme";
import { y2kTheme } from "./themes/y2k/y2kTheme";
import HelloWorld from "./features/hello/HelloWorld";

function App() {
  return (
    <Theme theme={y2kTheme}>
      <HelloWorld />
    </Theme>
  );
}

export default App;
