import { buildType } from "./rollup-util";
export default buildType({
	postfix: ".browser",
	babel: true,
	uglify: false,
	format: "umd"
});
