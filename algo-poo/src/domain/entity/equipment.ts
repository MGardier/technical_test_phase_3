import { EquipmentType} from "../../dto/enums";
import { EquipmentDTO } from "../../dto/input.dto";


export class Equipment {

  public readonly id: string;
  public readonly name: string;
  public readonly type: EquipmentType;


  constructor(
    id: string,
    name: string,
    type: EquipmentType,


  ) {
    this.id = id;
    this.name = name;
    this.type = type;

  }

  static fromDTO(dto: EquipmentDTO): Equipment {
    return new Equipment(
      dto.id,
      dto.name,
      dto.type,

    );
  }

}
