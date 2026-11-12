import { Trash2 } from 'lucide-react-native';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  border: '#CBD5E1',
  danger: '#DC2626',
  white: '#FFFFFF',
  textMuted: '#64748B',
};

interface ImageThumbnailListProps {
  images: string[];
  onRemove?: (index: number) => void;
  onImagePress?: (index: number) => void;
}

export function ImageThumbnailList({
  images,
  onRemove,
  onImagePress,
}: ImageThumbnailListProps) {
  if (images.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No leaf photos captured yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      horizontal
      keyExtractor={(item, index) => `${item}-${index}`}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => (
        <View style={styles.thumbnailWrap}>
          <Pressable
            onPress={() => onImagePress?.(index)}
            style={({ pressed }) => [
              styles.pressable,
              pressed ? styles.pressed : null,
            ]}
          >
            <Image source={{ uri: item }} style={styles.thumbnail} />
            <View style={styles.indexPill}>
              <Text style={styles.indexText}>#{index + 1}</Text>
            </View>
          </Pressable>

          {onRemove ? (
            <Pressable
              accessibilityLabel={`Remove image ${index + 1}`}
              onPress={() => onRemove(index)}
              style={styles.removeButton}
            >
              <Trash2 size={13} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    paddingVertical: 6,
    paddingRight: 10,
  },
  thumbnailWrap: {
    position: 'relative',
    paddingTop: 6,
    paddingRight: 6,
  },
  pressable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  indexPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(13, 31, 60, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.danger,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  empty: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    fontStyle: 'italic',
  },
});
