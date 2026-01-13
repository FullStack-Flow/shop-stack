export interface AttributeValue {
  id: string;
  name: string;
  slug: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
  values: AttributeValue[];
  type: 'select' | 'color' | 'image' | 'label';
}

export interface AttributeFormValues {
  name: string;
  slug: string;
  type: 'select' | 'color' | 'image' | 'label';
  values: AttributeValue[];
}

export interface AttributePermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
}
