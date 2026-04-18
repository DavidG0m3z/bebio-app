import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../../constants/theme';

interface DatePickerModalProps {
  visible: boolean;
  currentDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
}

export default function DatePickerModal({
  visible,
  currentDate,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
  title = 'Seleccionar fecha',
}: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState(currentDate);

  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setTempDate(date);
  };

  const handleConfirm = () => {
    onConfirm(tempDate);
  };

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="default"
        onChange={(_, date) => {
          if (date) onConfirm(date);
          else onCancel();
        }}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
          }}
        >
          {/* Handle decorativo */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#E5E7EB',
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}
          />

          {/* Header con botones */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <Text style={{ color: '#1A1A2E', fontWeight: 'bold', fontSize: 16 }}>
              {title}
            </Text>

            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spinner de fecha */}
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="es-CO"
            style={{
              width: '100%',
              height: 200,
              backgroundColor: '#FFFFFF',
            }}
          />
        </View>
      </View>
    </Modal>
  );
}