--
-- PostgreSQL database dump
--

\restrict XFakXkp9uLu6ZFkve2RLu3dwyMbsgyExL0mHbQmPUTu481MKkTmfYi073J3HyKH

-- Dumped from database version 17.11
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bug_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bug_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    reporter_name text,
    reporter_email text,
    severity text DEFAULT 'normal'::text NOT NULL,
    device_info text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: sample_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sample_images (
    id uuid NOT NULL,
    sample_id uuid NOT NULL,
    file_path text NOT NULL,
    sort_order integer NOT NULL,
    user_id uuid
);


--
-- Name: samples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.samples (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    clone_number text NOT NULL,
    tree_number text NOT NULL,
    leaf_number text NOT NULL,
    leaf_position text NOT NULL,
    meter_reading_1 real NOT NULL,
    meter_reading_2 real NOT NULL,
    meter_reading_3 real NOT NULL,
    flush text NOT NULL,
    flush_auto_detected boolean DEFAULT false NOT NULL,
    gps_latitude real,
    gps_longitude real,
    gps_accuracy real,
    garden_name text NOT NULL,
    section_name text NOT NULL,
    healthy boolean DEFAULT false NOT NULL,
    wilting boolean DEFAULT false NOT NULL,
    chlorosis boolean DEFAULT false NOT NULL,
    scorching boolean DEFAULT false NOT NULL,
    pest_damage boolean DEFAULT false NOT NULL,
    disease boolean DEFAULT false NOT NULL,
    wet_lab_completed boolean DEFAULT false NOT NULL,
    device_manufacturer text NOT NULL,
    device_model text NOT NULL,
    os_name text NOT NULL,
    os_version text NOT NULL,
    installation_id text NOT NULL,
    app_version text NOT NULL,
    remarks text DEFAULT ''::text NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bug_reports bug_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_pkey PRIMARY KEY (id);


--
-- Name: sample_images sample_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_images
    ADD CONSTRAINT sample_images_pkey PRIMARY KEY (id);


--
-- Name: samples samples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.samples
    ADD CONSTRAINT samples_pkey PRIMARY KEY (id);


--
-- Name: sample_images sample_images_sample_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sample_images
    ADD CONSTRAINT sample_images_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(id) ON DELETE CASCADE;


--
-- Name: sample_images Allow authenticated delete on sample_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated delete on sample_images" ON public.sample_images FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: samples Allow authenticated delete on samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated delete on samples" ON public.samples FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: sample_images Allow authenticated insert on sample_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated insert on sample_images" ON public.sample_images FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: samples Allow authenticated insert on samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated insert on samples" ON public.samples FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: sample_images Allow authenticated update on sample_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated update on sample_images" ON public.sample_images FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: samples Allow authenticated update on samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated update on samples" ON public.samples FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: bug_reports Allow public insert on bug_reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert on bug_reports" ON public.bug_reports FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: bug_reports Allow public read on bug_reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on bug_reports" ON public.bug_reports FOR SELECT TO authenticated, anon USING (true);


--
-- Name: sample_images Allow public read on sample_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on sample_images" ON public.sample_images FOR SELECT TO authenticated, anon USING (true);


--
-- Name: samples Allow public read on samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on samples" ON public.samples FOR SELECT TO authenticated, anon USING (true);


--
-- Name: sample_images Enable insert for users based on user_id; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for users based on user_id" ON public.sample_images FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: sample_images Enable users to view their own data only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable users to view their own data only" ON public.sample_images FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));


--
-- Name: samples Users can insert their own samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own samples" ON public.samples FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: samples Users can update their own samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own samples" ON public.samples FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: samples Users can view their own samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own samples" ON public.samples FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: bug_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: sample_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sample_images ENABLE ROW LEVEL SECURITY;

--
-- Name: samples; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict XFakXkp9uLu6ZFkve2RLu3dwyMbsgyExL0mHbQmPUTu481MKkTmfYi073J3HyKH

