// import { router } from 'expo-router';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { Controller, useForm } from 'react-hook-form';
// import {
//   Alert,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// import { ActionButton } from '@/components/ActionButton';
// import { CameraModal } from '@/components/CameraModal';
// import { CheckboxRow } from '@/components/CheckboxRow';
// import { DropdownField } from '@/components/DropdownField';
// import { FormField } from '@/components/FormField';
// import { ImageThumbnailList } from '@/components/ImageThumbnailList';
// import { SampleListItem } from '@/components/SampleListItem';
// import { ScreenHeader } from '@/components/ScreenHeader';
// import { SearchBar } from '@/components/SearchBar';
// import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
// import { sampleRepository } from '@/database/sampleRepository';
// import { useImageCapture } from '@/hooks/useImageCapture';
// import { deleteSampleImage } from '@/services/imageService';
// import { useSampleStore } from '@/store/sampleStore';
// import type { SampleFormInput } from '@/types/sample';

// type EditFormValues = SampleFormInput;

// export function UpdateSampleScreen() {

//   const leafOptions = [
//     { label: '1st Leaf', value: '1st_leaf' },
//     { label: '2nd Leaf', value: '2nd_leaf' },
//     { label: '3rd Leaf', value: '3rd_leaf' },
//     { label: '4th Leaf', value: '4th_leaf' },
//     { label: '5th Leaf', value: '5th_leaf' },
//     { label: 'Maintenance Leaf', value: 'maintenance_leaf' },
//   ];

//   const {
//     samples,
//     loading,
//     searchQuery,
//     selectedSampleId,
//     loadSamples,
//     setSearchQuery,
//     selectSample,
//     refreshSelectedSample,
//   } = useSampleStore();

//   const selectedSample = useMemo(
//     () => samples.find((sample) => sample.id === selectedSampleId) ?? null,
//     [samples, selectedSampleId],
//   );

//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { isDirty },
//   } = useForm<EditFormValues>({
//     defaultValues: {
//       cloneNumber: '',
//       treeNumber: '',
//       leafNumber: '',
//       leafPosition: '',
//       meterTaken: false,
//       wetLabRequired: false,
//       wetLabCompleted: false,
//       notes: '',
//     },
//   });

//   const cloneNumber = watch('cloneNumber');
//   const treeNumber = watch('treeNumber');
//   const leafNumber = watch('leafNumber');

//   const {
//     images,
//     showCamera,
//     setShowCamera,
//     openCamera,
//     handleCapture,
//     removeImage,
//     setExistingImages,
//   } = useImageCapture({ cloneNumber, treeNumber, leafNumber });

//   const [saving, setSaving] = useState(false);
//   const [removedPaths, setRemovedPaths] = useState<string[]>([]);

//   useEffect(() => {
//     loadSamples();
//   }, [loadSamples]);

//   useEffect(() => {
//     if (!selectedSample) return;
//     reset({
//       cloneNumber: selectedSample.cloneNumber,
//       treeNumber: selectedSample.treeNumber,
//       leafNumber: selectedSample.leafNumber,
//       leafPosition: selectedSample.leafPosition,
//       meterTaken: selectedSample.meterTaken,
//       wetLabRequired: selectedSample.wetLabRequired,
//       wetLabCompleted: selectedSample.wetLabCompleted,
//       notes: selectedSample.notes,
//     });
//     setExistingImages(selectedSample.images);
//     setRemovedPaths([]);
//   }, [reset, selectedSample, setExistingImages]);

//   const handleSearch = useCallback(
//     (text: string) => {
//       setSearchQuery(text);
//       loadSamples(text);
//     },
//     [loadSamples, setSearchQuery],
//   );

//   const handleRemoveImage = useCallback(
//     (index: number) => {
//       const path = images[index]?.filePath ?? images[index]?.uri;
//       if (path) {
//         setRemovedPaths((current) => [...current, path]);
//       }
//       removeImage(index);
//     },
//     [images, removeImage],
//   );

//   const onSubmit = handleSubmit(async (values) => {
//     if (!selectedSample) return;

//     setSaving(true);
//     try {
//       const imagePaths = images.map((image) => image.filePath ?? image.uri);
//       if (imagePaths.length === 0) {
//         throw new Error('At least one image is required.');
//       }

//       await sampleRepository.update(selectedSample.id, {
//         ...values,
//         images: imagePaths,
//       });

//       removedPaths.forEach(deleteSampleImage);
//       await refreshSelectedSample();
//       Alert.alert('Updated', 'Sample saved successfully.');
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Failed to update sample.';
//       Alert.alert('Update failed', message);
//     } finally {
//       setSaving(false);
//     }
//   });

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={styles.page}>
//         <View style={styles.container}>
//           <View>
//           <ScreenHeader title="Update Sample" subtitle="Search and edit existing records" />

//           <SearchBar value={searchQuery} onChangeText={handleSearch} />

//           </View>
          
//           <FlatList
//             data={samples}
//             keyExtractor={(item) => item.id}
//             style={styles.list}
//             contentContainerStyle={styles.listContent}
//             ListEmptyComponent={
//               loading ? (
//                 <Text style={styles.empty}>Loading samples...</Text>
//               ) : (
//                 <Text style={styles.empty}>No samples found.</Text>
//               )
//             }
//             renderItem={({ item }) => (
//               <SampleListItem
//                 sample={item}
//                 selected={item.id === selectedSampleId}
//                 onPress={() => selectSample(item.id)}
//               />
//             )}
//           />

//           {selectedSample ? (
//             <ScrollView style={styles.editor} contentContainerStyle={styles.editorContent}>
//               <Text style={styles.editorTitle}>Edit Sample</Text>
//               <Text style={styles.sampleId}>{selectedSample.id}</Text>

//               <ActionButton label="Capture Images" onPress={openCamera} />
//               <ImageThumbnailList
//                 images={images.map((image) => image.uri)}
//                 onRemove={handleRemoveImage}
//               />

//               <Controller
//                 control={control}
//                 name="cloneNumber"
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <FormField label="Clone Number" value={value} onBlur={onBlur} onChangeText={onChange} />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="treeNumber"
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <FormField
//                     label="Tree Number"
//                     keyboardType="number-pad"
//                     value={value}
//                     onBlur={onBlur}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="leafNumber"
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <FormField
//                     label="Leaf Number"
//                     keyboardType="number-pad"
//                     value={value}
//                     onBlur={onBlur}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="leafPosition"
//                 render={({ field: { onChange, value } }) => (
//                   <DropdownField
//                     label="Leaf Position"
//                     value={value}
//                     onValueChange={onChange}
//                     options={leafOptions}
//                   />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="meterTaken"
//                 render={({ field: { value, onChange } }) => (
//                   <CheckboxRow label="Meter Reading Taken?" value={value} onValueChange={onChange} />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="wetLabRequired"
//                 render={({ field: { value, onChange } }) => (
//                   <CheckboxRow label="Wet Lab Required?" value={value} onValueChange={onChange} />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="wetLabCompleted"
//                 render={({ field: { value, onChange } }) => (
//                   <CheckboxRow label="Wet Lab Completed?" value={value} onValueChange={onChange} />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="notes"
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <FormField
//                     label="Notes"
//                     multiline
//                     numberOfLines={3}
//                     value={value}
//                     onBlur={onBlur}
//                     onChangeText={onChange}
//                     style={styles.notesInput}
//                   />
//                 )}
//               />

//               <View style={styles.actions}>
//                 <ActionButton
//                   label={saving ? 'Saving...' : 'Save Changes'}
//                   onPress={onSubmit}
//                   disabled={saving || !isDirty}
//                 />
//                 <ActionButton
//                   label="Close Editor"
//                   variant="secondary"
//                   onPress={() => selectSample(null)}
//                 />
//               </View>
//             </ScrollView>
//           ) : null}

//           <ActionButton label="Back" onPress={() => router.back()} variant="secondary" style={styles.back} />

//           <CameraModal
//             visible={showCamera}
//             onClose={() => setShowCamera(false)}
//             onCapture={handleCapture}
//           />
//         </View>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   page: {
//     flex: 1
//   },
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//     padding: SPACING.lg,
//     justifyContent: 'space-between'
//   },
//   list: {
//     maxHeight: 220,
//     marginBottom: SPACING.md,
//   },
//   listContent: {
//     paddingBottom: SPACING.sm,
//   },
//   empty: {
//     fontSize: FONT_SIZES.body,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//     padding: SPACING.md,
//   },
//   editor: {
//     flex: 1,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//     borderRadius: 8,
//     backgroundColor: COLORS.surface,
//     marginBottom: SPACING.sm,
//   },
//   editorContent: {
//     padding: SPACING.md,
//   },
//   editorTitle: {
//     fontSize: FONT_SIZES.subtitle,
//     fontWeight: '700',
//     color: COLORS.text,
//     marginBottom: SPACING.xs,
//   },
//   sampleId: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     marginBottom: SPACING.md,
//   },
//   notesInput: {
//     minHeight: 96,
//     textAlignVertical: 'top',
//   },
//   actions: {
//     gap: SPACING.sm,
//     marginTop: SPACING.sm,
//   },
//   back: {
//     marginBottom: SPACING.md,
//   },
// });
