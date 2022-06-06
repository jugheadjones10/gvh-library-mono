import { Typography, Space, Select as AntSelect } from "antd";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const { Option: AntOption } = AntSelect;
const { Text } = Typography;

function FilterFormControl({ value, setValue, options, label }) {
  const theme = useTheme();
  const aboveSM = useMediaQuery(theme.breakpoints.up("sm"));

  return aboveSM ? (
    <FormControl size="small" sx={{ m: 1, width: 150 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(event) => {
          setValue(event.target.value);
       }}
      >
        <MenuItem value="" sx={{ color: "text.disabled" }}>
          None
        </MenuItem>
        {options.map((option) => {
          return <MenuItem value={option}>{option}</MenuItem>;
        })}
      </Select>
    </FormControl>
  ) : (
    <Space
      size={1}
      style={{
        margin: "5px",
        flexBasis: "0%",
        flexGrow: 1,
        overflow: "hidden",
      }}
      direction="vertical"
    >
      <Text type="secondary">{label}</Text>
      <AntSelect
        style={{ width: "100%" }}
        defaultValue={value || ""}
        onChange={(value) => {
          setValue(value);
        }}
        dropdownMatchSelectWidth={false}
      >
        <AntOption value="">None</AntOption>
        {options.map((option) => {
          return <AntOption value={option}>{option}</AntOption>;
        })}
      </AntSelect>
    </Space>
  );
}
export default FilterFormControl;
