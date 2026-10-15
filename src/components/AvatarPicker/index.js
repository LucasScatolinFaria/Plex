import Avatar from "../Avatar";
import Bouncy from "../Bouncy";
import { AvatarGrid, AvatarRing } from "./style";

// Grade para escolher um avatar (cadastro, visitante e edição do perfil).
export default function AvatarPicker({ avatars, value, onChange, size = 46 }) {
  return (
    <AvatarGrid accessibilityRole="radiogroup">
      {avatars.map((item) => (
        <Bouncy
          key={item.id}
          onPress={() => onChange(item.id)}
          sound="pop"
          accessibilityRole="radio"
          accessibilityLabel={`Avatar ${item.id}`}
          accessibilityState={{ selected: value === item.id }}
        >
          <AvatarRing $selected={value === item.id}>
            <Avatar id={item.id} size={size} ring={false} />
          </AvatarRing>
        </Bouncy>
      ))}
    </AvatarGrid>
  );
}
